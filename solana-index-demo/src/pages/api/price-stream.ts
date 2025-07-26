// pages/api/price-stream.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import http from 'node:http'
import https from 'node:https'
import axios from 'axios'

// 既存 /pages/api/pyth.ts と同じ ID リストを使って良い（ここに直書きも可）
const PRICE_IDS = [
  'e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43', // BTC
  'ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace', // ETH
  'ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d', // SOL
  '2f95862b045670cd22bee3114c39763a4a08beeb663b145d283c31d7d1101c4f', // BNB
  'ec5d399846a9209f3fe5881d70aae9268c94339ff9817e8d18ff19fa05eea1c8', // XRP
  'dcef50dd0a4cd2dcc17e45df1676dcb336a11a61c69df7a0299b0150c672d25c', // DOGE
  '2a01deaec9e51a579277b34b122399984d0bbf57e2458a7e42fecd2829867a0d', // ADA
  '93da3352f9f1d105fdfe4971cfa80e9dd777bfc5d0f683ebb6e1294b92137bb7', // AVAX
  '67aed5a24fdad045475e7195c98a98aea119c763f272d4523f5bac93a4f33c2b', // TRX
  '23d7315113f5b1d3ba7a83604c44b94d79f4fd69af77f804fc7f920a6dc65744', // SUI
] as const

// Keep‑Alive でRTTのバラつきを抑える
const httpAgent  = new http.Agent({ keepAlive: true, maxSockets: 64 })
const httpsAgent = new https.Agent({ keepAlive: true, maxSockets: 64 })

export const config = {
  api: {
    bodyParser: false, // SSEはストリーミングなので無効化
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // --- 必須ヘッダ（SSE 仕様）
  res.setHeader('Content-Type',  'text/event-stream; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store, no-transform') // キャッシュ禁止
  res.setHeader('Connection',    'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no') // 一部リバースプロキシのバッファ無効化

  // 初期イベント（クライアントの自動再接続間隔も指定可）
  res.write(`retry: 3000\n`)
  res.write(`event: ready\n`)
  res.write(`data: {"ok":true}\n\n`)

  let closed = false
  req.on('close', () => { closed = true; clearInterval(tick); clearInterval(ka) })

  const send = (obj: unknown) => res.write(`data: ${JSON.stringify(obj)}\n\n`)
  const sendComment = (s: string) => res.write(`: ${s}\n\n`) // keep‑alive コメント

  // 1Hz で Pyth Hermes から取得し、そのまま push
  const tick = setInterval(async () => {
    if (closed) return
    try {
      const { data } = await axios.get(
        'https://hermes.pyth.network/api/latest_price_feeds',
        { params: { ids: PRICE_IDS, binary: false }, httpAgent, httpsAgent }
      )
      // フロントの期待形に正規化（0x除去・小文字化、expoキーに合わせる）
      const normalized = data.map((d: any) => ({
           id: String(d.id).replace(/^0x/, '').toLowerCase(),
           price: {
             price: d.price.price,
             // Hermes の正式フィールドは expo。万一の差異に備えフォールバックも入れる
             expo:  (d.price.expo ?? d.price.exponent ?? 0),
           },
         }))
      send({ type: 'prices', payload: normalized, t: Date.now() })
    } catch (e: any) {
      send({ type: 'error', message: e?.message || 'fetch failed' })
    }
  }, 1000)

  // 15秒ごとに心拍（プロキシのタイムアウト回避）
  const ka = setInterval(() => { if (!closed) sendComment('keep-alive') }, 15000)
}
