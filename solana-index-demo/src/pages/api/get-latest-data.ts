import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
  const apiKey = process.env.CRYPTOCOMPARE_API_KEY;

  if (!supabaseUrl || !supabaseServiceKey || !apiKey) {
    return res.status(500).json({ error: "Server environment variables are not configured correctly." });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const CONSTITUENT_SYMBOLS = ['BTC', 'ETH', 'XRP', 'BNB', 'SOL', 'DOGE', 'TRX', 'ADA', 'SUI', 'AVAX'];

  try {
    // --- 1. pricemultifullエンドポイントで全データを一括取得 ---
    const fullPriceResponse = await fetch(`https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${CONSTITUENT_SYMBOLS.join(',')}&tsyms=USD&api_key=${apiKey}`);
    if (!fullPriceResponse.ok) throw new Error('Failed to fetch full constituent data.');
    const fullPriceData = await fullPriceResponse.json();

    // APIのRAWデータから必要な情報だけを抽出・整形
    const constituentPrices = CONSTITUENT_SYMBOLS.map(symbol => {
      const data = fullPriceData.RAW?.[symbol]?.USD;
      return {
        symbol: symbol,
        price: data?.PRICE || 0,
        change: data?.CHANGEPCTHOUR || 0, // 1時間ごとの変動率をAPIから直接取得
        marketCap: data?.MKTCAP || 0,
        volume24h: data?.TOTALVOLUME24HTO || 0,
      };
    });

    // --- 2. インデックス履歴と前日比の取得（変更なし） ---
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
    
    let dailyChange: number | null = null;
    if (historyData && historyData.length >= 2) {
      const latestData = historyData[historyData.length - 1];
      const previousDayData = historyData.filter(d => new Date(d.created_at) < today_0_jst).pop();
      if (latestData && previousDayData) {
        const latestValue = Number(latestData.index_value);
        const previousValue = Number(previousDayData.index_value);
        if (previousValue > 0 && isFinite(latestValue) && isFinite(previousValue)) {
          dailyChange = ((latestValue - previousValue) / previousValue) * 100;
        }
      }
    }
    
    const limitedHistory = historyData ? historyData.slice(-100) : [];

    // --- 3. フロントエンドに返すデータをまとめる ---
    res.status(200).json({
      indexHistory: limitedHistory,
      constituentPrices,
      dailyChange,
    });

  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}