import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

// 型定義: 計算の内訳データに変動率を追加
type Breakdown = {
  symbol: string;
  basePrice: number;
  currentPrice: number;
  ratio: number;
  change24h: number | null; // ★★★ 24時間変動率を追加
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);
  const apiKey = process.env.CRYPTOCOMPARE_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured.' });

  const CONSTITUENT_SYMBOLS = ['BTC', 'ETH', 'XRP', 'BNB', 'SOL', 'DOGE', 'TRX', 'ADA', 'SUI', 'AVAX'];

  try {
    // 1. pricemultifullで現在の価格や変動率などを一括取得
    const fullPriceResponse = await fetch(`https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${CONSTITUENT_SYMBOLS.join(',')}&tsyms=USD&api_key=${apiKey}`);
    if (!fullPriceResponse.ok) throw new Error('Failed to fetch full prices.');
    const fullPriceData = await fullPriceResponse.json();

    // 2. 1年前の価格を取得 & 計算内訳データを作成
    const oneYearAgoTimestamp = Math.floor(Date.now() / 1000) - (365 * 24 * 60 * 60);
    const breakdownData: Breakdown[] = [];
    for (const symbol of CONSTITUENT_SYMBOLS) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const historicalResponse = await fetch(`https://min-api.cryptocompare.com/data/v2/histoday?fsym=${symbol}&tsym=USD&limit=1&toTs=${oneYearAgoTimestamp}&api_key=${apiKey}`);
      if (!historicalResponse.ok) continue;

      const historicalData = await historicalResponse.json();
      if (historicalData.Response === 'Success' && historicalData.Data.Data.length > 0) {
        const currentPrice = Number(fullPriceData.RAW?.[symbol]?.USD.PRICE);
        const basePrice = Number(historicalData.Data.Data[0].close);
        
        // ★★★ 24時間変動率も取得 ★★★
        const change24h = fullPriceData.RAW?.[symbol]?.USD.CHANGEPCT24HOUR || null;

        if (isFinite(currentPrice) && isFinite(basePrice) && basePrice > 0) {
          breakdownData.push({
            symbol,
            basePrice,
            currentPrice,
            ratio: currentPrice / basePrice,
            change24h: Number(change24h),
          });
        }
      }
    }

    if (breakdownData.length === 0) throw new Error('Could not generate any breakdown data.');

    // 3. 指数を計算
    const sumOfRatios = breakdownData.reduce((sum, item) => sum + item.ratio, 0);
    const indexValue = (100 / breakdownData.length) * sumOfRatios;

    // 4. 計算結果と「計算の内訳」を一緒にDBへ保存
    const { error: insertError } = await supabase
      .from('index_history')
      .insert({ 
        index_value: indexValue, 
        calculation_breakdown: {
          sumOfRatios: sumOfRatios,
          assets: breakdownData 
        }
      });

    if (insertError) throw new Error(`Failed to save to Supabase: ${insertError.message}`);

    res.status(200).json({ message: 'Index and breakdown updated successfully!', indexValue });

  } catch (err: any) {
    console.error(`Error in /api/update-index: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
}