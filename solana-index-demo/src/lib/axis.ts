// src/lib/axis.ts
import { PublicKey } from '@solana/web3.js';

export const PROGRAM_ID = new PublicKey('9tBJstf7q2MZXSmSECCLoXV5YMaEpQHNfWLwT33MLzdg');

// initialize.ts の結果
export const STATE     = new PublicKey('AheJyVHxRRMXxoiMoQUXje4rX4XwhuK4pPKcaF7dSV2Z');
export const INDEX_MINT= new PublicKey('4J3cT8J1QAxVvAqgLBMxhSxi5s95NrQqEksBTytCrxDA');
export const USDC_MINT = new PublicKey('2Xos1H2fh1GFgmfUq968JnFS8B47G1Uqa8gFUs4a2F43');
export const VAULT_USDC= new PublicKey('7h1ZcXK4GABsxYopQm3PBQqCdGsKc7ynyACsdv6Qwzhp');

// 便利：表示用
export const ADDRS = {
  program: PROGRAM_ID.toBase58(),
  state:   STATE.toBase58(),
  index:   INDEX_MINT.toBase58(),
  usdc:    USDC_MINT.toBase58(),
  vault:   VAULT_USDC.toBase58(),
};
