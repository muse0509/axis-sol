import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

// Supabaseクライアントを初期化（サーバーサイドではサービスキーを使用）
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { address } = req.body;

  if (!address || typeof address !== 'string') {
    return res.status(400).json({ error: 'Wallet address is required' });
  }

  try {
    const { data, error } = await supabase
      .from('waitlist')
      .insert({ wallet_address: address })
      .select()
      .single();

    if (error) {
      // '23505'は一意性制約違反（重複登録）のエラーコード
      if (error.code === '23505') {
        return res.status(409).json({ message: 'This address is already on the waitlist.' });
      }
      throw error;
    }

    res.status(201).json({ message: 'Successfully joined the waitlist!', data });
  } catch (error: any) {
    console.error('Error joining waitlist:', error);
    res.status(500).json({ error: error.message || 'An unexpected error occurred.' });
  }
}