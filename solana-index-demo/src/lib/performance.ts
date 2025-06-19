import { SupabaseClient } from '@supabase/supabase-js';

// パフォーマンスデータの型を定義
export type PerformanceData = {
  latestValue: number;
  latestDate: string;
  oneYearReturn: number | null;
  ytdReturn: number | null;
};

// 指定された日付に最も近い過去のデータを取得する内部関数
async function getClosestRecord(supabase: SupabaseClient, targetDate: Date) {
  const { data, error } = await supabase
    .from('index_history')
    .select('index_value, created_at')
    .gte('created_at', targetDate.toISOString()) // 指定日以降で
    .order('created_at', { ascending: true })   // 最も古いレコード
    .limit(1)
    .single();
  
  if (error) {
    console.error(`Error fetching record for date ${targetDate.toISOString()}:`, error.message);
    return null;
  }
  return data;
}


// パフォーマンス指標をまとめて取得・計算するメイン関数
export async function getPerformanceMetrics(supabase: SupabaseClient): Promise<PerformanceData | null> {
  try {
    // 1. 最新の指数データを取得
    const { data: latestRecord, error: latestError } = await supabase
      .from('index_history')
      .select('index_value, created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (latestError || !latestRecord) {
      throw new Error('Could not fetch the latest index value.');
    }

    const latestValue = latestRecord.index_value;

    // 2. 1年前、年初の目標日付を設定
    const now = new Date();
    const oneYearAgoDate = new Date(now);
    oneYearAgoDate.setFullYear(now.getFullYear() - 1);
    
    const startOfYearDate = new Date(now.getFullYear(), 0, 1);

    // 3. 各時点のデータを取得
    const oneYearAgoRecord = await getClosestRecord(supabase, oneYearAgoDate);
    const startOfYearRecord = await getClosestRecord(supabase, startOfYearDate);

    // 4. リターンを計算
    const oneYearReturn = oneYearAgoRecord
      ? ((latestValue / oneYearAgoRecord.index_value) - 1) * 100
      : null;
      
    const ytdReturn = startOfYearRecord
      ? ((latestValue / startOfYearRecord.index_value) - 1) * 100
      : null;

    return {
      latestValue: latestValue,
      latestDate: new Date(latestRecord.created_at).toLocaleDateString(),
      oneYearReturn: oneYearReturn,
      ytdReturn: ytdReturn,
    };

  } catch (error) {
    console.error('Failed to get performance metrics:', error);
    return null;
  }
}