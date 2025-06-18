import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { OracleManager } from '../oracles/OracleManager';
import { INDEX_ASSETS } from '../config/oracleStrategies';

async function getBasePrice(symbol: string, supabase: SupabaseClient): Promise<number> {
  // ここに、Supabaseから基準日（例: 1年前）の価格を取得するロジックを実装します。
  // 今回はダミーの固定値を返します。
  const basePrices: Record<string, number> = {
    'BTC': 65000,
    'ETH': 3500,
    'LINK': 15,
    'BNB': 580,
    'SOL': 150,
    'DOGE': 0.15,
    'TRX': 0.12,
    'ADA': 0.45,
    'SUI': 1.0,
    'AVAX': 35,
  };
  return basePrices[symbol] || 0;
}

export async function runIndexUpdateJob() {
  console.log('Starting index update job...');

  const oracleManager = new OracleManager();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const pricePromises = INDEX_ASSETS.map(symbol => oracleManager.getAssetPrice(symbol));
    const currentPrices = await Promise.all(pricePromises);

    const assetDataPromises = INDEX_ASSETS.map(async (symbol, i) => {
      const currentPrice = currentPrices[i];
      const basePrice = await getBasePrice(symbol, supabase);
      if (basePrice === 0) throw new Error(`Base price for ${symbol} is zero.`);
      
      return {
        symbol,
        currentPrice,
        basePrice,
        ratio: currentPrice / basePrice,
        change24h: null,
      };
    });

    const assets = await Promise.all(assetDataPromises);
    const sumOfRatios = assets.reduce((sum, asset) => sum + asset.ratio, 0);
    const indexValue = (sumOfRatios / assets.length);

    const calculation_breakdown = {
        sumOfRatios,
        assets,
    };

    const { data, error } = await supabase
      .from('index_history')
      .insert({
        index_value: indexValue,
        calculation_breakdown: calculation_breakdown,
      })
      .select()
      .single();

    if (error) throw error;

    console.log(`Successfully updated index. New Index Value: ${indexValue}`);
    return { success: true, data };

  } catch (error: any) {
    console.error('Error during index update job:', error);
    return { success: false, error: error.message };
  }
}