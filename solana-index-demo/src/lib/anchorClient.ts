/*
 * =================================================================
 * 1. src/lib/anchorClient.ts
 * =================================================================
 */

import { AnchorProvider, Program } from '@coral-xyz/anchor'
import type { Connection, PublicKey } from '@solana/web3.js'
import { PublicKey as Web3PublicKey } from '@solana/web3.js'
import {
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import type { WalletContextState } from '@solana/wallet-adapter-react'
import { IDL as RAW_IDL, type AxisIndex } from './idl/axis_index'

export const PROGRAM_ID = new Web3PublicKey('9tBJstf7q2MZXSmSECCLoXV5YMaEpQHNfWLwT33MLzdg')
export const USDC_MINT  = new Web3PublicKey('2Xos1H2fh1GFgmfUq968JnFS8B47G1Uqa8gFUs4a2F43')

// [最終修正] 新しいStateのSeed
const STATE_SEED: Buffer = Buffer.from("state-v7");

export const TOKEN_PROGRAM = TOKEN_PROGRAM_ID
export const ASSOCIATED_TOKEN_PROGRAM = ASSOCIATED_TOKEN_PROGRAM_ID

export function getProgram(connection: Connection, wallet: WalletContextState): Program<AxisIndex> {
  if (!RAW_IDL || !RAW_IDL.instructions) { throw new Error("IDL could not be loaded.") }
  const provider = new AnchorProvider(connection, wallet as any, { commitment: 'confirmed' })
  const idlAny: any = JSON.parse(JSON.stringify(RAW_IDL));
  idlAny.address = PROGRAM_ID.toBase58();
  return new Program(idlAny, provider)
}

export function deriveStatePda(): [PublicKey, number] {
  return Web3PublicKey.findProgramAddressSync([STATE_SEED, PROGRAM_ID.toBuffer()], PROGRAM_ID)
}

export async function fetchState(program: Program<AxisIndex>) {
  const [statePda] = deriveStatePda();
  return await program.account.fundState.fetch(statePda);
}

export async function getUserUsdcBalance(connection: Connection, owner: PublicKey, mint: PublicKey): Promise<number> {
  try {
    const ata = await getAssociatedTokenAddress(mint, owner)
    const info = await connection.getTokenAccountBalance(ata)
    return info.value.uiAmount ?? 0
  } catch { return 0 }
}

export const formatAddress = (pk: PublicKey) => `${pk.toBase58().slice(0, 4)}…${pk.toBase58().slice(-4)}`

