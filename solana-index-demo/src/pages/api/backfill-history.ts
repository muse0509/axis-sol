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
  // このAPIは非常に重く、時間がかかるため、
  // 開発環境でのみ、あるいは合言葉を知っている場合のみ実行できるようにします。
  if (process.env.NODE_ENV === 'production') {
     const authHeader = req.headers['authorization'];
     if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
       return res.status(401).json({ error: 'Unauthorized' });
     }
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
  const apiKey = process.env.CRYPTOCOMPARE_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured.' });

  const CONSTITUENT_SYMBOLS = ['BTC', 'ETH', 'XRP', 'BNB', 'SOL', 'DOGE', 'TRX', 'ADA', 'SUI', 'AVAX'];
  const nowTimestamp = Math.floor(Date.now() / 1000);

  try {
    res.status(202).json({ message: "Backfill process started. This will take a long time. Please monitor the server console and database." });

    // 過去365日分を1日ずつループ
    for (let i = 1; i <= 365; i++) {
      const targetTimestamp = nowTimestamp - (i * ONE_DAY_SECONDS);
      const baseTimestamp = targetTimestamp - (365 * ONE_DAY_SECONDS);
      
      console.log(`Processing data for day ${i}/365 (Timestamp: ${targetTimestamp})...`);

      // 1. その日の価格を取得 (histodayは終値を使う)
      const currentPricePromises = CONSTITUENT_SYMBOLS.map(symbol => 
        fetch(`https://min-api.cryptocompare.com/data/v2/histoday?fsym=${symbol}&tsym=USD&limit=1&toTs=${targetTimestamp}&api_key=${apiKey}`).then(res => res.json())
      );
      const currentPriceResults = await Promise.all(currentPricePromises);

      // 2. さらにその1年前の価格を取得
      const basePricePromises = CONSTITUENT_SYMBOLS.map(symbol => 
        fetch(`https://min-api.cryptocompare.com/data/v2/histoday?fsym=${symbol}&tsym=USD&limit=1&toTs=${baseTimestamp}&api_key=${apiKey}`).then(res => res.json())
      );
      const basePriceResults = await Promise.all(basePricePromises);
      
      const breakdownData: Breakdown[] = [];
      for (let j = 0; j < CONSTITUENT_SYMBOLS.length; j++) {
        const symbol = CONSTITUENT_SYMBOLS[j];
        const currentData = currentPriceResults[j];
        const baseData = basePriceResults[j];

        if (currentData?.Response === 'Success' && currentData.Data?.Data?.length > 0 &&
            baseData?.Response === 'Success' && baseData.Data?.Data?.length > 0) {
              
          const currentPrice = Number(currentData.Data.Data[0].close);
          const basePrice = Number(baseData.Data.Data[0].close);
          
          if (isFinite(currentPrice) && isFinite(basePrice) && basePrice > 0) {
            breakdownData.push({
              symbol,
              basePrice,
              currentPrice,
              ratio: currentPrice / basePrice,
              change24h: null, // 過去データでは24h変動は計算しない
            });
          }
        }
      }

      if (breakdownData.length > 0) {
        const sumOfRatios = breakdownData.reduce((sum, item) => sum + item.ratio, 0);
        const indexValue = (100 / breakdownData.length) * sumOfRatios;
        
        // 日付を偽装してDBに保存
        const targetDate = new Date(targetTimestamp * 1000);
        await supabase.from('index_history').insert({ 
          index_value: indexValue, 
          calculation_breakdown: { sumOfRatios, assets: breakdownData },
          created_at: targetDate.toISOString(), // ★★★ 過去の日付で挿入
        });
      }
      
      // API制限を避けるための待機
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log("Backfill process completed!");
    // このAPIは長時間かかるため、ここでのres.sendはクライアントに届かない

  } catch (err: any) {
    console.error(`Error during backfill process: ${err.message}`);
    // エラーが発生しても処理は続行される可能性があるため、ログで確認
  }
}