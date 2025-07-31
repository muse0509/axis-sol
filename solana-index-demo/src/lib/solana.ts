// /lib/solana.ts
import { Connection, Keypair, PublicKey } from '@solana/web3.js'
import bs58 from 'bs58'

export const connection = new Connection(process.env.SOLANA_RPC_URL!, 'confirmed')
export const TREASURY_OWNER = new PublicKey(process.env.TREASURY_OWNER!)

function toKeypairFromAny(raw: string): Keypair {
  const s = raw.trim()
  if (!s) throw new Error('TREASURY_PRIVATE_KEY is empty')

  // 1) JSON 数値配列（[n0,n1,...]）
  if (s.startsWith('[')) {
    const arr = JSON.parse(s)
    const u8 = Uint8Array.from(arr)
    if (u8.length === 64) return Keypair.fromSecretKey(u8)
    if (u8.length === 32) return Keypair.fromSeed(u8)      // v1系: fromSeed は 32B シード
    throw new Error(`Invalid JSON key length: ${u8.length} (expected 32 or 64)`)
  }

  // 2) Base58（Phantomなど）
  try {
    const u8 = bs58.decode(s)
    if (u8.length === 64) return Keypair.fromSecretKey(u8)
    if (u8.length === 32) return Keypair.fromSeed(u8)
    throw new Error(`Invalid base58 key length: ${u8.length} (expected 32 or 64)`)
  } catch (e) {
    throw new Error('Invalid base58 in TREASURY_PRIVATE_KEY')
  }
}

export function loadTreasurySigner(): Keypair {
  const raw = process.env.TREASURY_PRIVATE_KEY || ''
  const kp = toKeypairFromAny(raw)
  // **本人確認**：設定の TREASURY_OWNER と一致しなければ即エラー
  if (!kp.publicKey.equals(TREASURY_OWNER)) {
    throw new Error(
      `Signer pubkey mismatch. ENV TREASURY_OWNER=${TREASURY_OWNER.toBase58()} but keypair=${kp.publicKey.toBase58()}`
    )
  }
  return kp
}
