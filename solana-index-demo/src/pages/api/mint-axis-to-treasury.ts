// /pages/api/mint-axis-to-treasury.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import {
  Connection, PublicKey, VersionedTransaction, TransactionMessage, ComputeBudgetProgram,
} from '@solana/web3.js'
import {
  getAssociatedTokenAddress,
  getAccount,
  createAssociatedTokenAccountInstruction,
  mintToChecked,
  getMint,                      // ← 追加：decimals を取る
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  ACCOUNT_SIZE,
} from '@solana/spl-token'
import { loadTreasurySigner } from '@/lib/loadSigner'

/** ===== env ===== */
const RPC_URL         = process.env.RPC_URL!
const ALT_AIRDROP_RPC = process.env.ALT_AIRDROP_RPC_URL || 'https://api.devnet.solana.com'
const AUTO_AIRDROP    = (process.env.AUTO_AIRDROP ?? 'true').toLowerCase() === 'true'

const AXIS_MINT = new PublicKey(process.env.AXIS_MINT!)
const TREASURY  = new PublicKey(process.env.TREASURY_WALLET!)

/** ===== utils ===== */
function uiToSmallest(ui: string, decimals: number): bigint {
  if (!/^\d+(\.\d+)?$/.test(ui)) throw new Error('amount must be a number string')
  const [i, f = ''] = ui.split('.')
  const frac = (f + '0'.repeat(decimals)).slice(0, decimals)
  return BigInt(i + frac)
}

async function sendV0WithSim(connection: Connection, tx: VersionedTransaction): Promise<string> {
  const sim = await connection.simulateTransaction(tx, { sigVerify: false, commitment: 'processed' })
  if (sim.value.err) {
    console.error('[simulate] err =', sim.value.err, 'logs =', sim.value.logs)
    throw new Error(`simulate failed: ${JSON.stringify(sim.value.err)}`)
  }
  const sig = await connection.sendTransaction(tx, { maxRetries: 5 })
  await connection.confirmTransaction(sig, 'confirmed')
  return sig
}

async function airdropWithFallback(heliusConn: Connection, to: PublicKey, lamports: number) {
  try {
    const sig = await heliusConn.requestAirdrop(to, lamports)
    await heliusConn.confirmTransaction(sig, 'finalized')
    return
  } catch (e: any) {
    const msg = String(e?.message || e)
    if (!/403|rate limit/i.test(msg)) throw e
    console.warn('[airdrop] Helius limit hit, fallback to Foundation RPC…')
  }
  const fndConn = new Connection(ALT_AIRDROP_RPC, 'confirmed')
  const sig2 = await fndConn.requestAirdrop(to, lamports)
  await fndConn.confirmTransaction(sig2, 'finalized')
}

async function ensureFeePayerFunds(connection: Connection, feePayer: PublicKey) {
  const rentForTokenAccount = await connection.getMinimumBalanceForRentExemption(ACCOUNT_SIZE)
  const feeBufferLamports = Math.ceil(0.001 * 1e9)
  const need = BigInt(rentForTokenAccount + feeBufferLamports)
  const bal  = await connection.getBalance(feePayer, 'processed')
  if (BigInt(bal) >= need || !AUTO_AIRDROP) return
  const topUp = Number(need - BigInt(bal))
  await airdropWithFallback(connection, feePayer, topUp)
}

/** Treasury の AXIS ATA を finalized で確実に用意 */
async function ensureAtaFinalized(
  connection: Connection,
  payer: ReturnType<typeof loadTreasurySigner>,
  mint: PublicKey,
  owner: PublicKey,
  programId: PublicKey,
): Promise<PublicKey> {
  const ata = await getAssociatedTokenAddress(mint, owner, false, programId)
  try {
    await getAccount(connection, ata, 'finalized', programId)
    return ata
  } catch {
    await ensureFeePayerFunds(connection, payer.publicKey)
    const ix = createAssociatedTokenAccountInstruction(
      payer.publicKey, // payer
      ata,             // ata
      owner,           // owner
      mint,
      programId,
    )
    const { blockhash } = await connection.getLatestBlockhash('finalized')
    const msg = new TransactionMessage({
      payerKey: payer.publicKey,
      recentBlockhash: blockhash,
      instructions: [
        ComputeBudgetProgram.setComputeUnitLimit({ units: 200_000 }),
        ix,
      ],
    }).compileToV0Message()
    const tx = new VersionedTransaction(msg)
    tx.sign([payer])
    const sig = await sendV0WithSim(connection, tx)
    await connection.confirmTransaction(sig, 'finalized')
    return ata
  }
}

/** ===== Next.js handler ===== */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') return res.status(405).end()
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const amountUi = body?.amount
    if (!amountUi) throw new Error('amount is required (UI units)')

    const connection = new Connection(RPC_URL, 'confirmed')
    const signer     = loadTreasurySigner()

    // --- 0) ミントが Token か Token-2022 か自動判定（owner で分かる）
    const mintAccInfo = await connection.getAccountInfo(AXIS_MINT, 'confirmed')
    if (!mintAccInfo) throw new Error('AXIS_MINT not found on this cluster')
    const PROGRAM_ID =
      mintAccInfo.owner.equals(TOKEN_2022_PROGRAM_ID) ? TOKEN_2022_PROGRAM_ID : TOKEN_PROGRAM_ID

    // --- 1) ミントの実際の decimals を取得
    const mintInfo = await getMint(connection, AXIS_MINT, 'confirmed', PROGRAM_ID)
    const axisDecimals = mintInfo.decimals // ← これがオンチェーンの真値

    // --- 2) Treasury の AXIS ATA を finalized で用意
    const treasuryAxisAta = await ensureAtaFinalized(connection, signer, AXIS_MINT, TREASURY, PROGRAM_ID)

    // --- 3) mintToChecked（decimals をミントの真値で）
    const smallest = uiToSmallest(String(amountUi), axisDecimals)
    const sig = await mintToChecked(
      connection,
      signer,                // payer
      AXIS_MINT,             // mint
      treasuryAxisAta,       // destination
      signer,                // mint authority
      smallest,              // amount (bigint)
      axisDecimals,          // 必ずミントと一致させる
      [],                    // multisig (なし)
      undefined,             // confirmOptions
      PROGRAM_ID,            // ← ここも Token or Token-22 を合わせる
    )

    res.status(200).json({
      ok: true,
      signature: sig,
      ata: treasuryAxisAta.toBase58(),
      decimals: axisDecimals,          // デバッグ確認用
      programId: PROGRAM_ID.toBase58() // デバッグ確認用
    })
  } catch (e: any) {
    console.error(e)
    res.status(500).json({ ok: false, error: e?.message || 'internal error' })
  }
}
