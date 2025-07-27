// src/lib/axis.ts
import { PublicKey } from '@solana/web3.js'
import { getAssociatedTokenAddressSync } from '@solana/spl-token'
import idl from './idl/axis_index.json'

// --- env チェック（クライアント公開値は NEXT_PUBLIC_ 必須）
function mustEnv(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`Missing ${name} in .env.local`)
  return v
}

// Program ID は .env を優先し、無ければ IDL の address
export const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_PROGRAM_ID ?? (idl as any).address
)

// すべて PublicKey として export
export const USDC_MINT  = new PublicKey(mustEnv('NEXT_PUBLIC_USDC_MINT'))
export const INDEX_MINT = new PublicKey(mustEnv('NEXT_PUBLIC_INDEX_MINT'))

// seeds = ["state", program_id] で PDA を計算
export const [STATE] = PublicKey.findProgramAddressSync(
  [Buffer.from('state'), PROGRAM_ID.toBuffer()],
  PROGRAM_ID
)

// STATE を owner にした USDC の ATA（allowOwnerOffCurve = true）
export const VAULT_USDC = getAssociatedTokenAddressSync(
  USDC_MINT,
  STATE,
  true // allowOwnerOffCurve
)
