import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface ReferralData {
  referrer_address: string;
  referred_address: string;
  timestamp: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { referrer, referred } = req.body;

    if (!referrer || !referred || typeof referrer !== 'string' || typeof referred !== 'string') {
      return res.status(400).json({ error: 'Both referrer and referred addresses are required' });
    }

    if (referrer === referred) {
      return res.status(400).json({ error: 'Cannot refer yourself' });
    }

    try {
      const { data: existing, error: checkError } = await supabase
        .from('referrals')
        .select('*')
        .eq('referred_address', referred)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
        throw checkError;
      }

      if (existing) {
        return res.status(409).json({ message: 'This address has already been referred' });
      }

      const { data, error } = await supabase
        .from('referrals')
        .insert({
          referrer_address: referrer,
          referred_address: referred,
          timestamp: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      res.status(201).json({ message: 'Referral recorded successfully!', data });
    } catch (error: any) {
      console.error('Error recording referral:', error);
      
      if (error.code === '42P01') {
        res.status(500).json({ 
          error: 'Database tables not found. Please run the database setup first.',
          code: error.code,
          hint: 'Execute the SQL in setup-database.sql in your Supabase SQL Editor'
        });
      } else {
        res.status(500).json({ error: error.message || 'An unexpected error occurred.' });
      }
    }
  } else if (req.method === 'GET') {
    const { address } = req.query;

    try {
      if (address) {
        const { data, error } = await supabase
          .from('referrals')
          .select('*')
          .eq('referrer_address', address);

        if (error) {
          throw error;
        }

        const referralCount = data?.length || 0;
        const referredAddresses = data?.map(r => r.referred_address) || [];

        res.status(200).json({
          address,
          referralCount,
          referredAddresses
        });
      } else {
        const { data, error } = await supabase
          .from('referrals')
          .select('referrer_address')
          .order('timestamp', { ascending: false });

        if (error) {
          throw error;
        }

        const referralCounts: Record<string, number> = {};
        data?.forEach(record => {
          const address = record.referrer_address;
          referralCounts[address] = (referralCounts[address] || 0) + 1;
        });

        const leaderboard = Object.entries(referralCounts)
          .map(([address, count]) => ({ address, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 100); 

        res.status(200).json({ leaderboard });
      }
    } catch (error: any) {
      console.error('Error fetching referral data:', error);
      
      if (error.code === '42P01') {
        res.status(500).json({ 
          error: 'Database tables not found. Please run the database setup first.',
          code: error.code,
          hint: 'Execute the SQL in setup-database.sql in your Supabase SQL Editor, or visit /api/setup-database'
        });
      } else {
        res.status(500).json({ error: error.message || 'An unexpected error occurred.' });
      }
    }
  } else {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}