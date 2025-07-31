import bs58 from 'bs58'
import { Connection, Keypair, PublicKey, clusterApiUrl } from '@solana/web3.js'

export const rpcUrl = process.env.SOLANA_RPC_URL || clusterApiUrl('devnet')
export const connection = new Connection(rpcUrl, { commitment: 'confirmed' })

export function loadTreasurySigner(): Keypair {
  const raw = process.env.TREASURY_PRIVATE_KEY?.trim()
  if (!raw) throw new Error('TREASURY_PRIVATE_KEY is missing')
  if (raw.startsWith('[')) return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(raw)))
  return Keypair.fromSecretKey(bs58.decode(raw)) // Phantom Base58
}

export const TREASURY_OWNER = new PublicKey(process.env.TREASURY_OWNER!)
