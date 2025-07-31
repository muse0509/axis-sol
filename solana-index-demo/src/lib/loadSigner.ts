// lib/loadSigner.ts
import { Keypair } from '@solana/web3.js'
import bs58 from 'bs58'

export function loadTreasurySigner(): Keypair {
  const base58 = process.env.TREASURY_PRIVATE_KEY_BASE58?.trim()
  const json   = process.env.TREASURY_SECRET_JSON?.trim()

  if (base58) {
    try {
      const bytes = bs58.decode(base58)
      return Keypair.fromSecretKey(bytes)
    } catch (e) {
      throw new Error('Invalid TREASURY_PRIVATE_KEY_BASE58 (Base58 decode failed)')
    }
  }

  if (json) {
    try {
      const arr = JSON.parse(json)
      return Keypair.fromSecretKey(Uint8Array.from(arr))
    } catch {
      throw new Error('Invalid TREASURY_SECRET_JSON (must be JSON number array)')
    }
  }

  throw new Error('Set TREASURY_PRIVATE_KEY_BASE58 or TREASURY_SECRET_JSON')
}
