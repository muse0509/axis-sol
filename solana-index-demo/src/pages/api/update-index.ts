import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

// Supabaseクライアントを初期化
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const CONSTITUENT_SYMBOLS = [
  'BTC', 'ETH', 'XRP', 'BNB', 'SOL', 
  'DOGE', 'TRX', 'ADA', 'SUI', 'AVAX'
];

const CRYPTOCOMPARE_API_BASE = 'https://min-api.cryptocompare.com';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // セキュリティチェック
  const authHeader = req.headers['authorization'];
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const apiKey = process.env.CRYPTOCOMPARE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ message: 'Server configuration error.', error: 'CryptoCompare API key is not set.' });
  }

  try {
    // --- 1. 現在の価格を取得 ---
    const currentPriceResponse = await fetch(
      `${CRYPTOCOMPARE_API_BASE}/data/pricemulti?fsyms=${CONSTITUENT_SYMBOLS.join(',')}&tsyms=USD&api_key=${apiKey}`
    );
    if (!currentPriceResponse.ok) throw new Error('Failed to fetch current prices from CryptoCompare.');
    const currentPriceData = await currentPriceResponse.json();

    // --- 2. 1年前の価格を取得 ---
    const oneYearAgoTimestamp = Math.floor(Date.now() / 1000) - (365 * 24 * 60 * 60);
    const historicalPrices: { [symbol: string]: number } = {};

    for (const symbol of CONSTITUENT_SYMBOLS) {
      await new Promise(resolve => setTimeout(resolve, 200)); 

      const historicalResponse = await fetch(
        `${CRYPTOCOMPARE_API_BASE}/data/v2/histoday?fsym=${symbol}&tsyms=USD&limit=1&toTs=${oneYearAgoTimestamp}&api_key=${apiKey}`
      );
      if (!historicalResponse.ok) {
        console.warn(`Could not fetch historical data for ${symbol}. Skipping.`);
        continue;
      }
      const historicalData = await historicalResponse.json();
      
      if (historicalData.Response === 'Success' && historicalData.Data.Data.length > 0) {
        historicalPrices[symbol] = historicalData.Data.Data[0].close;
      } else {
        console.warn(`No historical data found for ${symbol} a year ago. Skipping.`);
      }
    }

    // --- 3. 指数の計算（堅牢化） ---
    const priceRatios: number[] = [];
    for (const symbol of CONSTITUENT_SYMBOLS) {
      const currentPrice = currentPriceData[symbol]?.USD;
      const historicalPrice = historicalPrices[symbol];

      // ★★★ 値が両方とも、正の数であることを厳密にチェック ★★★
      const currentPriceNum = Number(currentPrice);
      const historicalPriceNum = Number(historicalPrice);

      if (isFinite(currentPriceNum) && isFinite(historicalPriceNum) && historicalPriceNum > 0) {
        priceRatios.push(currentPriceNum / historicalPriceNum);
      } else {
        console.warn(`Skipping ratio calculation for ${symbol} due to invalid price data.`);
      }
    }
    
    if (priceRatios.length === 0) {
      throw new Error('Could not calculate any price ratios. Check API responses or symbols.');
    }

    const sumOfRatios = priceRatios.reduce((sum, ratio) => sum + ratio, 0);
    const indexValue = (100 / priceRatios.length) * sumOfRatios;

    // --- 4. Supabaseへ保存 ---
    const { error: insertIndexError } = await supabase.from('index_history').insert({ index_value: indexValue });
    if (insertIndexError) throw new Error(`Failed to save new index value: ${insertIndexError.message}`);

    res.status(200).json({ message: 'Index updated successfully with CryptoCompare!', indexValue });

  } catch (err: any) {
    console.error(`Error in /api/update-index: ${err.message}`);
    res.status(500).json({ message: 'An error occurred.', error: err.message });
  }
}