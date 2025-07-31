// pages/api/helius-webhook.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { PublicKey, Transaction, sendAndConfirmTransaction } from '@solana/web3.js'
import {
  getOrCreateAssociatedTokenAccount,
  createTransferCheckedInstruction,
  TOKEN_2022_PROGRAM_ID,
} from '@solana/spl-token'
import axios from 'axios'
import { connection, loadTreasurySigner, TREASURY_OWNER } from '@/lib/solana'

// --- env ---
const AUTH               = process.env.HELIUS_WEBHOOK_SECRET!          // 例: "Bearer dev-abc123xyz"
const USDC_DEV_MINT      = process.env.USDC_DEV_MINT!                  // Gh9Z... (devnet)
const TREASURY_USDC_ATA  = process.env.TREASURY_USDC_ATA!.trim()       // GPrfb...U1jxrB
const AXIS_MINT_2022     = process.env.AXIS_MINT_2022!                 // 6XJV...
const AXIS_DEC           = parseInt(process.env.AXIS_DECIMALS || '9', 10)
const PYTH_PRICE_IDS: string[] = JSON.parse(process.env.PYTH_PRICE_IDS || '[]')

// --- logging helper ---
const jlog = (obj: any) =>
  console.log(JSON.stringify({ ts: new Date().toISOString(), mod: 'helius-webhook', ...obj }))

// --- 指数計算（等ウェイト / ベース=100 の簡易版）---
async function fetchIndexValue(): Promise<number> {
  const { data } = await axios.get('https://hermes.pyth.network/api/latest_price_feeds', {
    params: { ids: PYTH_PRICE_IDS, binary: false },
  })
  const base: Record<string, number> = {
    BTC: 42739.27, ETH: 2528.09, XRP: 0.568, BNB: 309.09, SOL: 102.07,
    DOGE: 0.08053, TRX: 0.1083, ADA: 0.5278, SUI: 1.292, AVAX: 36.03
  }
  const idToSym: Record<string,string> = {
    'e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43':'BTC',
    'ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace':'ETH',
    'ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d':'SOL',
    '2f95862b045670cd22bee3114c39763a4a08beeb663b145d283c31d7d1101c4f':'BNB',
    'ec5d399846a9209f3fe5881d70aae9268c94339ff9817e8d18ff19fa05eea1c8':'XRP',
    'dcef50dd0a4cd2dcc17e45df1676dcb336a11a61c69df7a0299b0150c672d25c':'DOGE',
    '2a01deaec9e51a579277b34b122399984d0bbf57e2458a7e42fecd2829867a0d':'ADA',
    '93da3352f9f1d105fdfe4971cfa80e9dd777bfc5d0f683ebb6e1294b92137bb7':'AVAX',
    '67aed5a24fdad045475e7195c98a98aea119c763f272d4523f5bac93a4f33c2b':'TRX',
    '23d7315113f5b1d3ba7a83604c44b94d79f4fd69af77f804fc7f920a6dc65744':'SUI',
  }

  const latest: Record<string, number> = {}
  for (const d of data) {
    const expo = d.price?.expo ?? d.price?.exponent ?? 0
    latest[String(d.id).replace(/^0x/, '').toLowerCase()] =
      Number(d.price?.price) * Math.pow(10, expo)
  }

  const ratios = Object.entries(idToSym).map(([id, sym]) => {
    const p = latest[id] ?? 0
    const b = base[sym]
    return b ? p / b : 0
  })
  return 100 * (ratios.reduce((a, b) => a + b, 0) / ratios.length)
}

// --- USDC -> Treasury の着金抽出（tokenTransfers優先 / tbcもfallback） ---
type EnhancedEvent = any
function extractUsdcDeposits(ev: EnhancedEvent) {
  const out: Array<{
    uiAmount: number
    fromUser: string | null
    fromTokenAccount?: string
    src: 'tokenTransfers' | 'accountData'
  }> = []

  // 1) tokenTransfers（推奨）
  if (Array.isArray(ev?.tokenTransfers)) {
    for (const tt of ev.tokenTransfers) {
      if (tt?.mint === USDC_DEV_MINT && tt?.toTokenAccount === TREASURY_USDC_ATA) {
        // tokenAmount は UI 単位（decimals 済）で渡されます
        out.push({
          uiAmount: Number(tt?.tokenAmount ?? 0),
          fromUser: tt?.fromUserAccount ?? null,
          fromTokenAccount: tt?.fromTokenAccount,
          src: 'tokenTransfers',
        })
      }
    }
  }

  // 2) accountData[].tokenBalanceChanges（互換）
  if (Array.isArray(ev?.accountData)) {
    for (const a of ev.accountData) {
      const tbc = Array.isArray(a?.tokenBalanceChanges) ? a.tokenBalanceChanges : []
      for (const c of tbc) {
        const amt = Number(c?.rawTokenAmount?.tokenAmount ?? '0')
        if (c?.mint === USDC_DEV_MINT && c?.tokenAccount === TREASURY_USDC_ATA && amt > 0) {
          out.push({
            uiAmount: amt,                       // ここも UI 単位相当
            fromUser: c?.userAccount ?? null,
            fromTokenAccount: c?.tokenAccount,
            src: 'accountData',
          })
        }
      }
    }
  }
  return out
}

// --- AXIS(2022) を Treasury からユーザーへ送る（transferChecked + 2022 PID） ---
async function transferAxisToUser(userOwner: PublicKey, axisUiAmount: number) {
  const signer = loadTreasurySigner()
  const mint   = new PublicKey(AXIS_MINT_2022)

  // 送信元（Treasury）の AXIS(2022) ATA
  const src = (await getOrCreateAssociatedTokenAccount(
    connection, signer, mint, TREASURY_OWNER, false, 'confirmed', undefined, TOKEN_2022_PROGRAM_ID
  )).address

  // 受取人の AXIS(2022) ATA
  const dst = (await getOrCreateAssociatedTokenAccount(
    connection, signer, mint, userOwner, false, 'confirmed', undefined, TOKEN_2022_PROGRAM_ID
  )).address

  const amountSmallest = BigInt(Math.floor(axisUiAmount * 10 ** AXIS_DEC))

  const ix = createTransferCheckedInstruction(
    src, mint, dst, signer.publicKey, amountSmallest, AXIS_DEC, [], TOKEN_2022_PROGRAM_ID
  ) // Checked系は mint/decimals も検証。Token-2022 では programId 指定が重要。 :contentReference[oaicite:3]{index=3}

  const tx = new Transaction().add(ix)
  tx.feePayer = signer.publicKey

  const sig = await sendAndConfirmTransaction(connection, tx, [signer], { commitment: 'confirmed' })
  return sig
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  if (req.headers.authorization !== AUTH) {
    jlog({ lvl: 'warn', msg: 'unauthorized', got: req.headers.authorization })
    return res.status(401).json({ ok: false, error: 'unauthorized' })
  }

  // Helius からは単体 or 配列の両方が来る
  const events: EnhancedEvent[] = Array.isArray(req.body)
    ? req.body
    : (Array.isArray(req.body?.events) ? req.body.events : [req.body])

  jlog({ lvl: 'info', hit: true, ua: req.headers['user-agent'], ip: req.socket.remoteAddress, len: events.length })

  const results: any[] = []
  try {
    for (const ev of events) {
      const sig  = ev?.signature
      const type = ev?.type
      const desc = ev?.description
      jlog({ lvl: 'debug', evType: type, sig, slot: ev?.slot, desc })

      if (type && type !== 'TRANSFER') continue  // このWebhookはTRANSFERだけを対象 :contentReference[oaicite:4]{index=4}

      const deposits = extractUsdcDeposits(ev)
      jlog({ lvl: 'debug', step: 'extract', depositsCount: deposits.length, sig })

      for (const dep of deposits) {
        const { uiAmount, fromUser, src } = dep
        if (!fromUser) {
          jlog({ lvl: 'warn', sig, msg: 'missing fromUser, skip', src })
          continue
        }

        // 約定値（MVP：現値）
        const indexValue = await fetchIndexValue()
        const axisToSend = Number(uiAmount) / indexValue
        jlog({ lvl: 'debug', step: 'quote', sig, usdc: uiAmount, indexValue, axisToSend })

        // 払い出し
        const txSig = await transferAxisToUser(new PublicKey(fromUser), axisToSend)
        jlog({ lvl: 'info', step: 'payout', sig, payoutSig: txSig, to: fromUser, axisToSend })
        results.push({ from: fromUser, usdc: uiAmount, indexValue, axisSent: axisToSend, signature: txSig })
      }
    }

    return res.status(200).json({ ok: true, results })
  } catch (e: any) {
    jlog({ lvl: 'error', err: e?.message || String(e) })
    return res.status(500).json({ ok: false, error: e?.message || String(e) })
  }
}
