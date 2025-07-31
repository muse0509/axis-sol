// /pages/api/settlements/[sig].ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { getOne } from '@/lib/settlementStore'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()
  const sig = String(req.query.sig || '')
  if (!sig) return res.status(400).json({ ok:false, error:'missing sig' })
  const rec = getOne(sig)
  return res.status(200).json({ ok:true, record: rec })
}
