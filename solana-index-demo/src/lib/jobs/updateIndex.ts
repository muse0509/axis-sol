import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { OracleManager } from '../oracles/OracleManager';
import { INDEX_ASSETS } from '../config/oracleStrategies';

/**
 * DBから基準価格を取得する。もし存在しなければ、現在の価格で初期化してDBに保存する。
 * @param symbols - 対象資産のシンボル配列
 * @param oracleManager - OracleManagerのインスタンス
 * @param supabase - Supabaseクライアント
 * @returns {Promise<Record<string, number>>} シンボルをキー、価格を値とするオブジェクト
 */
async function getOrInitBasePrices(
  symbols: string[],
  oracleManager: OracleManager,
  supabase: SupabaseClient
): Promise<Record<string, number>> {
  console.log('Fetching or initializing base prices...');
  const { data: existingBasePrices, error } = await supabase.from('base_prices').select('symbol, price');

  if (error) {
    console.error('Error fetching base_prices:', error);
    throw error;
  }

  // 基準価格がすでにDBに存在し、資産の数が一致する場合
  if (existingBasePrices && existingBasePrices.length === symbols.length) {
    console.log('Found existing base prices in DB.');
    const prices: Record<string, number> = {};
    for (const record of existingBasePrices) {
      prices[record.symbol] = record.price;
    }
    return prices;
  }

  // --- 初回実行 or データが不完全な場合の初期化処理 ---
  console.log('Initializing base prices for the first time or re-initializing incomplete data...');
  const currentPricePromises = symbols.map(symbol => oracleManager.getAssetPrice(symbol));
  const initialPrices = await Promise.all(currentPricePromises);

  const basePricesToInsert = symbols.map((symbol, i) => ({
    symbol,
    price: initialPrices[i],
  }));

  // 不完全なデータが残らないよう、一度全件削除してから挿入する
  const { error: deleteError } = await supabase.from('base_prices').delete().neq('symbol', 'this_is_a_dummy_value');
  if (deleteError) {
      console.error('Failed to delete existing base prices:', deleteError);
      throw deleteError;
  }

  const { error: insertError } = await supabase.from('base_prices').insert(basePricesToInsert);
  if (insertError) {
    console.error('Failed to insert initial base prices:', insertError);
    throw insertError;
  }
  console.log('Successfully initialized and saved base prices to DB.');

  const newBasePrices: Record<string, number> = {};
  for (const record of basePricesToInsert) {
    newBasePrices[record.symbol] = record.price;
  }
  return newBasePrices;
}

export async function runIndexUpdateJob() {
  console.log('Starting index update job...');

  const oracleManager = new OracleManager();
  // Supabaseクライアントの初期化。必ずSERVICE_KEYを使います。
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY! // anon_key ではなく service_key
  );

  try {
    // 1. 基準価格をDBから取得（なければ初期化）
    const basePrices = await getOrInitBasePrices(INDEX_ASSETS, oracleManager, supabase);

    // 2. 現在のリアルタイム価格をオラクルから取得
    const currentPricePromises = INDEX_ASSETS.map(symbol => oracleManager.getAssetPrice(symbol));
    const currentPrices = await Promise.all(currentPricePromises);

    // 3. インデックス値を計算
    const assets = INDEX_ASSETS.map((symbol, i) => {
      const currentPrice = currentPrices[i];
      const basePrice = basePrices[symbol];
      if (basePrice === undefined || basePrice === 0) {
        throw new Error(`Base price for ${symbol} is invalid or not found.`);
      }
      return {
        symbol,
        currentPrice,
        basePrice,
        ratio: currentPrice / basePrice,
        change24h: null, // 24h変動は別途、DBから前日のデータを引くロジックが必要
      };
    });

    const sumOfRatios = assets.reduce((sum, asset) => sum + asset.ratio, 0);
    // フロントエンドでの正規化（/ baseIndexValue * 100）と区別するため、ここでは生の比率の平均値を保存
    const indexValue = (sumOfRatios / assets.length); 

    // 4. 計算結果を index_history テーブルに保存
    const { data, error } = await supabase
      .from('index_history')
      .insert({
        index_value: indexValue,
        calculation_breakdown: { sumOfRatios, assets },
      })
      .select()
      .single();

    if (error) throw error;

    console.log(`Successfully updated index. New Raw Index Value: ${indexValue}`);
    return { success: true, data };

  } catch (error: any) {
    console.error('Error during index update job:', error);
    return { success: false, error: error.message };
  }
}