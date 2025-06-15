import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // サービスキーを使用
  const apiKey = process.env.CRYPTOCOMPARE_API_KEY;

  if (!supabaseUrl || !supabaseServiceKey || !apiKey) {
    return res.status(500).json({ error: "Server environment variables are not configured correctly." });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const CONSTITUENT_SYMBOLS = ['BTC', 'ETH', 'XRP', 'BNB', 'SOL', 'DOGE', 'TRX', 'ADA', 'SUI', 'AVAX'];

  try {
    // ほぼgetServerSidePropsと同じロジックで最新データを取得
    const now = new Date();
    const today_0_jst = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const yesterday_0_jst = new Date(today_0_jst);
    yesterday_0_jst.setDate(yesterday_0_jst.getDate() - 1);
    
    const { data: historyData, error: historyError } = await supabase
      .from('index_history')
      .select('created_at, index_value')
      .order('created_at', { ascending: true })
      .gte('created_at', yesterday_0_jst.toISOString());

    if (historyError) throw new Error(historyError.message);

    const priceResponse = await fetch(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${CONSTITUENT_SYMBOLS.join(',')}&tsyms=USD&api_key=${apiKey}`);
    if (!priceResponse.ok) throw new Error('Failed to fetch constituent prices.');
    const priceData = await priceResponse.json();

    // --- 計算ロジック ---
    let dailyChange: number | null = null;
    if (historyData && historyData.length >= 2) {
      const latestData = historyData[historyData.length - 1];
      const previousDayData = historyData.filter(d => new Date(d.created_at) < today_0_jst).pop();
      if (latestData && previousDayData && previousDayData.index_value > 0) {
        dailyChange = ((latestData.index_value - previousDayData.index_value) / previousDayData.index_value) * 100;
      }
    }

    const constituentPrices = CONSTITUENT_SYMBOLS.map(symbol => ({
      symbol,
      price: priceData[symbol]?.USD || 0,
    }));
    
    const limitedHistory = historyData ? historyData.slice(-100) : [];

    // フロントエンドに返すデータをまとめる
    res.status(200).json({
      indexHistory: limitedHistory,
      constituentPrices,
      dailyChange,
    });

  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}