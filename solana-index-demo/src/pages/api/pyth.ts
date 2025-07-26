/* ---------- /pages/api/pyth.ts ---------- */
import type { NextApiRequest, NextApiResponse } from 'next'
import { LRUCache } from 'lru-cache'
import axios from 'axios'

// Hermes から返る型（必要に応じて厳密化してください）
export interface PythFeed {
  id: string
  price: { price: number; exponent: number }
}

type ApiResp = PythFeed[] | { error: string }

// ----- 1 秒 TTL・100件までキャッシュ -----npm i lru-cache@^11  
const cache = new LRUCache<string, PythFeed[]>({
  max: 100,          // 上限アイテム数（これがあるなら ttlAutopurge は必須ではない）
  ttl: 1000,         // ms。コメントに「1秒」とあるなら 1000 に
  // ttlAutopurge: true,  // ttlのみで使うなら推奨（Typedocの注意）。今回はmax併用なので任意
})

// 64‑byte Hex ID 一覧
const PRICE_IDS = [
  '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43', // BTC
  '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace', // ETH
  '0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d', // SOL
  '0x2f95862b045670cd22bee3114c39763a4a08beeb663b145d283c31d7d1101c4f', // BNB
  '0xec5d399846a9209f3fe5881d70aae9268c94339ff9817e8d18ff19fa05eea1c8', // XRP
  '0xdcef50dd0a4cd2dcc17e45df1676dcb336a11a61c69df7a0299b0150c672d25c', // DOGE
  '0x2a01deaec9e51a579277b34b122399984d0bbf57e2458a7e42fecd2829867a0d', // ADA
  '0x93da3352f9f1d105fdfe4971cfa80e9dd777bfc5d0f683ebb6e1294b92137bb7', // AVAX
  '0x67aed5a24fdad045475e7195c98a98aea119c763f272d4523f5bac93a4f33c2b', // TRX
  '0x23d7315113f5b1d3ba7a83604c44b94d79f4fd69af77f804fc7f920a6dc65744', // SUI
] as const

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse<ApiResp>
) {
  const KEY = 'latest'
  const hit = cache.get(KEY)
  if (hit) {
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate')
    return res.status(200).json(hit)
  }

  try {
    const { data } = await axios.get<PythFeed[]>(
      'https://hermes.pyth.network/api/latest_price_feeds',
      { params: { ids: PRICE_IDS, binary: false } }   // ← JSON 形式
    )
    cache.set(KEY, data)
    res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate')
    return res.status(200).json(data)
  } catch (err) {
    console.error('[pyth-api] Hermes fetch failed:', err)
    return res
      .status(502)
      .json({ error: 'Failed to fetch from Pyth Hermes endpoint' })
  }
}
