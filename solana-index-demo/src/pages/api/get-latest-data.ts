import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

export const revalidate = 0;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({ error: "Server environment variables are not configured correctly." });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { data: latestEntry, error: latestEntryError } = await supabase
      .from('index_history')
      .select('created_at, index_value, calculation_breakdown')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (latestEntryError) {
      if (latestEntryError.code === 'PGRST116') {
        return res.status(404).json({ error: "No index data found in DB." });
      }
      throw new Error(`Failed to fetch latest entry: ${latestEntryError.message}`);
    }
    
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
    // ★★★ データが2件未満でもエラーにせず、dailyChangeをnullのままにする ★★★
    if (historyData && historyData.length >= 2) {
      const previousDayData = historyData.filter(d => new Date(d.created_at) < today_0_jst).pop();
      if (previousDayData) {
        const latestValue = Number(latestEntry.index_value);
        const previousValue = Number(previousDayData.index_value);
        if (isFinite(latestValue) && isFinite(previousValue) && previousValue > 0) {
          dailyChange = ((latestValue - previousValue) / previousValue) * 100;
        }
      }
    }
    
    res.status(200).json({
      latestEntry: latestEntry,
      indexHistory: historyData ? historyData.slice(-100) : [],
      dailyChange,
    });

  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}