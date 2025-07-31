// /src/axis-sdk/AxisSDK.ts
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import {
    Connection,
    PublicKey,
    VersionedTransaction,
    TransactionMessage,
    TransactionInstruction,
  } from '@solana/web3.js'
  import {
    getAssociatedTokenAddress,
    createTransferInstruction,            // USDC (legacy SPL)
    createTransferCheckedInstruction,     // AXIS (Token-2022)
    TOKEN_2022_PROGRAM_ID,
  } from '@solana/spl-token'
  import type { WalletContextState } from '@solana/wallet-adapter-react'
  import { Buffer } from 'buffer'
  
  // Ensure Buffer exists in the browser bundle
  if (typeof globalThis !== 'undefined' && !(globalThis as any).Buffer) {
    ;(globalThis as any).Buffer = Buffer
  }
  
  // --- constants ---
  const TREASURY_WALLET_ADDRESS_STRING = 'BTcWoRe6Z9VaCPCxrcr5dQmn8cA8KNHpFdgJEVopSBsj'
  const INDEX_TOKEN_MINT_STRING        = '6XJVFiPQZ9pAa6Cuhcm6jbHtV3G3ZjK3VZ2HNTanpAQ1' // Token-2022
  const AXIS_DECIMALS                  = 9
  const USDC_MINT_STRING               = 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr'
  const MEMO_PROGRAM_ID_STRING         = 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'
  
  export class AxisSDK {
    private connection: Connection
    private wallet: WalletContextState
  
    constructor(connection: Connection, wallet: WalletContextState) {
      this.connection = connection
      this.wallet = wallet
    }
  
    /**
     * Build a USDC->Treasury transfer tx (for mint flow)
     */
    async buildUsdcDepositTransaction(usdcAmount: number): Promise<{ transaction: VersionedTransaction; memoId: string }> {
      if (!this.wallet.publicKey) throw new Error('Wallet is not connected.')
  
      const TREASURY  = new PublicKey(TREASURY_WALLET_ADDRESS_STRING)
      const USDC_MINT = new PublicKey(USDC_MINT_STRING)
      const MEMO_PID  = new PublicKey(MEMO_PROGRAM_ID_STRING)
  
      const amount = Math.floor(usdcAmount * 10 ** 6) // USDC devnet = 6 decimals
  
      const userUsdcAta     = await getAssociatedTokenAddress(USDC_MINT, this.wallet.publicKey) // legacy SPL
      const treasuryUsdcAta = await getAssociatedTokenAddress(USDC_MINT, TREASURY)
  
      const ixTransfer = createTransferInstruction(
        userUsdcAta,
        treasuryUsdcAta,
        this.wallet.publicKey,
        amount
      )
  
      const memoId = `AXIS_MINT_REQ_${Date.now()}`
      const memoIx = new TransactionInstruction({
        keys: [],
        programId: MEMO_PID,
        // 👇 Buffer で文字列をエンコードする
        data: Buffer.from(memoId, 'utf8'),
      })
  
      const { blockhash } = await this.connection.getLatestBlockhash()
      const msg = new TransactionMessage({
        payerKey: this.wallet.publicKey,
        recentBlockhash: blockhash,
        instructions: [ixTransfer, memoIx],
      }).compileToV0Message()
  
      return { transaction: new VersionedTransaction(msg), memoId }
    }
  
    /**
     * Build an AXIS(Token-2022)->Treasury transfer tx (for burn flow)
     */
    async buildIndexTokenDepositTransaction(indexTokenAmount: number): Promise<{ transaction: VersionedTransaction; memoId: string }> {
      if (!this.wallet.publicKey) throw new Error('Wallet is not connected.')
  
      const TREASURY = new PublicKey(TREASURY_WALLET_ADDRESS_STRING)
      const AXIS_MINT = new PublicKey(INDEX_TOKEN_MINT_STRING)
      const MEMO_PID  = new PublicKey(MEMO_PROGRAM_ID_STRING)
  
      const amount = Math.floor(indexTokenAmount * 10 ** AXIS_DECIMALS)
  
      // For Token-2022 ATAs use the 2022 program id in derivation when you will write to them
      const userAxisAta     = await getAssociatedTokenAddress(AXIS_MINT, this.wallet.publicKey, false, TOKEN_2022_PROGRAM_ID)
      const treasuryAxisAta = await getAssociatedTokenAddress(AXIS_MINT, TREASURY,             false, TOKEN_2022_PROGRAM_ID)
  
      const ixTransferChecked = createTransferCheckedInstruction(
        userAxisAta,
        AXIS_MINT,
        treasuryAxisAta,
        this.wallet.publicKey,
        BigInt(amount),
        AXIS_DECIMALS,
        [],
        TOKEN_2022_PROGRAM_ID
      )
  
      const memoId = `AXIS_BURN_REQ_${Date.now()}`
      const memoIx = new TransactionInstruction({
        keys: [],
        programId: MEMO_PID,
        data: Buffer.from(memoId, 'utf8'),
      })
  
      const { blockhash } = await this.connection.getLatestBlockhash()
      const msg = new TransactionMessage({
        payerKey: this.wallet.publicKey,
        recentBlockhash: blockhash,
        instructions: [ixTransferChecked, memoIx],
      }).compileToV0Message()
  
      return { transaction: new VersionedTransaction(msg), memoId }
    }
  }
  