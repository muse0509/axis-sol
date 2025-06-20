import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

// 1日の秒数
const ONE_DAY_SECONDS = 24 * 60 * 60;

// 型定義
type Breakdown = {
  symbol: string;
  basePrice: number;
  currentPrice: number;
  ratio: number;
  change24h: number | null;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  // --- [Debug] 環境変数の読み込み確認 ---
  console.log("--- Starting Backfill Process ---");
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
  const apiKey = process.env.CRYPTOCOMPARE_API_KEY;

  if (!supabaseUrl || !supabaseServiceKey || !apiKey) {
    console.error("🔴 ERROR: Environment variables are not fully configured.");
    console.log(`- NEXT_PUBLIC_SUPABASE_URL loaded: ${!!supabaseUrl}`);
    console.log(`- SUPABASE_SERVICE_KEY loaded: ${!!supabaseServiceKey}`);
    console.log(`- CRYPTOCOMPARE_API_KEY loaded: ${!!apiKey}`);
    // ここでreturnするとクライアントにエラーが返るが、バックフィルプロセスなのでサーバーログでの確認が主
    res.status(500).json({ error: 'Critical environment variables are not configured. Check server logs.' });
    return;
  }
  console.log("✅ Environment variables loaded successfully.");
  // --- [Debug] ここまで ---

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const CONSTITUENT_SYMBOLS = ['BTC', 'ETH', 'XRP', 'BNB', 'SOL', 'DOGE', 'TRX', 'ADA', 'SUI', 'AVAX'];
  const nowTimestamp = Math.floor(Date.now() / 1000);

  try {
    // 長時間処理のため、まずクライアントにレスポンスを返す
    res.status(202).json({ message: "Backfill process started. This will take a long time. Please monitor the server console and database." });

    // 過去365日分を1日ずつループ
    for (let i = 1; i <= 365; i++) {
      const targetTimestamp = nowTimestamp - (i * ONE_DAY_SECONDS);
      const baseTimestamp = targetTimestamp - (365 * ONE_DAY_SECONDS);
      
      console.log(`\n--- 🔄 Processing Day ${i}/365 (Timestamp: ${targetTimestamp}) ---`);

      // 1. その日の価格を取得
      const currentPricePromises = CONSTITUENT_SYMBOLS.map(symbol => 
        fetch(`https://min-api.cryptocompare.com/data/v2/histoday?fsym=${symbol}&tsym=USD&limit=1&toTs=${targetTimestamp}&api_key=${apiKey}`).then(res => res.json())
      );
      const currentPriceResults = await Promise.all(currentPricePromises);

      // 2. さらにその1年前の価格を取得
      const basePricePromises = CONSTITUENT_SYMBOLS.map(symbol => 
        fetch(`https://min-api.cryptocompare.com/data/v2/histoday?fsym=${symbol}&tsym=USD&limit=1&toTs=${baseTimestamp}&api_key=${apiKey}`).then(res => res.json())
      );
      const basePriceResults = await Promise.all(basePricePromises);

      // --- [Debug] APIレスポンスの簡易チェック ---
      console.log(`[API Check] BTC current price response status: ${currentPriceResults[0]?.Response}`);
      console.log(`[API Check] BTC base price response status: ${basePriceResults[0]?.Response}`);
      // --- [Debug] ここまで ---
      
      const breakdownData: Breakdown[] = [];
      for (let j = 0; j < CONSTITUENT_SYMBOLS.length; j++) {
        const symbol = CONSTITUENT_SYMBOLS[j];
        const currentData = currentPriceResults[j];
        const baseData = basePriceResults[j];

        if (currentData?.Response === 'Success' && currentData.Data?.Data?.length > 0 &&
            baseData?.Response === 'Success' && baseData.Data?.Data?.length > 0) {
              
          const currentPrice = Number(currentData.Data.Data[0].close);
          const basePrice = Number(baseData.Data.Data[0].close);

          // --- [Debug] 抽出した価格データの確認 ---
          console.log(`[${symbol}] Fetched Prices | Current: ${currentPrice}, Base: ${basePrice}`);
          
          if (isFinite(currentPrice) && isFinite(basePrice) && basePrice > 0) {
            breakdownData.push({
              symbol,
              basePrice,
              currentPrice,
              ratio: currentPrice / basePrice,
              change24h: null,
            });
          } else {
            console.warn(`[${symbol}] ⚠️ WARNING: Invalid or zero price found. Skipping.`);
          }
        } else {
          // --- [Debug] APIデータ取得失敗時のログ ---
          console.warn(`[${symbol}] ⚠️ WARNING: Could not retrieve valid data from CryptoCompare.`);
        }
      }

      // --- [Debug] breakdownDataの内容とDB挿入前のデータ確認 ---
      console.log(`Finished processing symbols. breakdownData contains ${breakdownData.length} valid items.`);

      if (breakdownData.length > 0) {
        const sumOfRatios = breakdownData.reduce((sum, item) => sum + item.ratio, 0);
        const indexValue = (100 / breakdownData.length) * sumOfRatios;
        const targetDate = new Date(targetTimestamp * 1000);

        const payload = { 
          index_value: indexValue, 
          calculation_breakdown: { sumOfRatios, assets: breakdownData },
          created_at: targetDate.toISOString(),
        };

        console.log(`Attempting to insert into DB for date ${payload.created_at}. Index Value: ${payload.index_value}`);
        // console.log("Payload:", JSON.stringify(payload, null, 2)); // 詳細を見たい場合はコメントアウトを外す

        // Supabaseへの挿入とエラーハンドリング
        const { error } = await supabase.from('index_history').insert(payload);

        if (error) {
          console.error(`🔴 DATABASE ERROR on ${targetDate.toISOString()}:`, error);
        } else {
          console.log(`✅ Successfully inserted data for ${targetDate.toISOString()}`);
        }
        // --- [Debug] ここまで ---

      } else {
        console.warn("⚠️ WARNING: breakdownData is empty. Skipping database insertion for this timestamp.");
      }
      
      // API制限を避けるための待機
      console.log("Waiting for 1 second to avoid API rate limits...");
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log("\n🎉 --- Backfill process completed! ---");

  } catch (err: any) {
    console.error(`🔴 FATAL ERROR during backfill process: ${err.message}`);
    console.error(err.stack);
  }
}