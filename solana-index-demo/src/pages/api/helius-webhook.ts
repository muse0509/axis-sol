// /pages/api/helius-webhook.ts
import type { NextApiRequest, NextApiResponse } from 'next'

const AUTH = process.env.HELIUS_WEBHOOK_SECRET ?? 'Bearer <<<RANDOM_SECRET>>>'
const USDC_DEV_MINT = 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr'
const TREASURY_USDC_ATA = 'GPrfbGCK2rBEYL2jy7mMq9pYBht1tTss6ZfLUwU1jxrB '

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  if (req.headers.authorization !== AUTH) return res.status(401).end()

  // Helius は "単一イベント" または "配列" で届く場合があるため両対応
  const events = Array.isArray(req.body) ? req.body : (Array.isArray(req.body?.events) ? req.body.events : [req.body])

  for (const ev of events) {
    // Enhanced Webhook では "type" や "description"、"accountData.tokenBalanceChanges" 等が付与されます
    // 1) タイプで一次フィルタ
    if (ev?.type !== 'TRANSFER') continue

    // 2) USDC-Dev の "着金先が Treasury の USDC ATA" を満たすか確認
    const tokenChanges = ev?.accountData?.find?.(() => true)?.tokenBalanceChanges ? ev.accountData.flatMap((a: any) => a.tokenBalanceChanges) : []
    const isUsdcToTreasuryAta = tokenChanges?.some((c: any) =>
      c?.mint === USDC_DEV_MINT && c?.tokenAccount === TREASURY_USDC_ATA && Number(c?.rawTokenAmount?.tokenAmount) > 0
    )
    if (!isUsdcToTreasuryAta) continue

    // 3) 重要メタ：signature / slot / timestamp
    const signature = ev?.signature
    const blockTime = ev?.timestamp  // Enhanced には timestamp が含まれます（人間可読の一部）
    // → ブロックタイムで約定価格を固定（後段で Hermes/Pyth 価格取得）

    // 4) 冪等：memoId 等の重複キーで既処理判定（DB など）
    // await db.orders.upsert({ ... })

    // 5) "finalized" 到達を待ってから配布処理へ
    // 公式ガイドにあるとおり、confirmed→finalized の二段階にすると安定します
    // await waitUntilFinalized(signature)

    // 6) ここで indexPrice を取得して配布（transferChecked or transfer）
    // await settleMintByTransfer({ signature, blockTime, ... })
  }

  return res.status(200).json({ ok: true })
}
