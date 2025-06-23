import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // { count: 'exact', head: true } を使うことで、全データを取得せずに件数だけを効率的に取得できます。
    const { count, error } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true });

    if (error) {
      throw error;
    }

    res.status(200).json({ count: count ?? 0 });
  } catch (error: any) {
    console.error('Error fetching waitlist count:', error);
    res.status(500).json({ error: error.message || 'An unexpected error occurred.' });
  }
}