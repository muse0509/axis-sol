// /axis-sdk/AxisSDK.ts
import {
    PublicKey, VersionedTransaction, TransactionMessage, TransactionInstruction
  } from '@solana/web3.js'
  import {
    getAssociatedTokenAddress,
    createTransferInstruction,           // USDC (legacy SPL)
    createTransferCheckedInstruction,    // AXIS (Token-2022)
    TOKEN_2022_PROGRAM_ID,
  } from '@solana/spl-token'
  
  const TREASURY_WALLET_ADDRESS_STRING = 'BTcWoRe6Z9VaCPCxrcr5dQmn8cA8KNHpFdgJEVopSBsj'
  const INDEX_TOKEN_MINT_STRING        = '6XJVFiPQZ9pAa6Cuhcm6jbHtV3G3ZjK3VZ2HNTanpAQ1' // Token-2022
  const AXIS_DECIMALS                  = 9
  const USDC_MINT_STRING               = 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr'
  const MEMO_PROGRAM_ID_STRING         = 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr' // official. :contentReference[oaicite:5]{index=5}
  
  export class AxisSDK {
    constructor(connection, wallet) { this.connection = connection; this.wallet = wallet }
  
    async buildUsdcDepositTransaction(usdcAmount) {
      if (!this.wallet.publicKey) throw new Error('Wallet is not connected.')
      const TREASURY = new PublicKey(TREASURY_WALLET_ADDRESS_STRING)
      const USDC_MINT = new PublicKey(USDC_MINT_STRING)
      const MEMO_PID  = new PublicKey(MEMO_PROGRAM_ID_STRING)
  
      const amount = Math.floor(usdcAmount * 10 ** 6) // USDC devnet = 6 decimals
  
      const userUsdcAta     = await getAssociatedTokenAddress(USDC_MINT, this.wallet.publicKey) // legacy SPL (default)
      const treasuryUsdcAta = await getAssociatedTokenAddress(USDC_MINT, TREASURY)
  
      const ixTransfer = createTransferInstruction(userUsdcAta, treasuryUsdcAta, this.wallet.publicKey, amount)
  
      const memoId = `AXIS_MINT_REQ_${Date.now()}`
      const memo = new TransactionInstruction({ keys: [], programId: MEMO_PID, data: Buffer.from(memoId, 'utf-8') })
  
      const { blockhash } = await this.connection.getLatestBlockhash()
      const msg = new TransactionMessage({
        payerKey: this.wallet.publicKey, recentBlockhash: blockhash, instructions: [ixTransfer, memo]
      }).compileToV0Message()
  
      return { transaction: new VersionedTransaction(msg), memoId } // ← ここを変更
    }
  
    async buildIndexTokenDepositTransaction(indexTokenAmount) {
      if (!this.wallet.publicKey) throw new Error('Wallet is not connected.')
      const TREASURY = new PublicKey(TREASURY_WALLET_ADDRESS_STRING)
      const AXIS_MINT = new PublicKey(INDEX_TOKEN_MINT_STRING)
      const MEMO_PID  = new PublicKey(MEMO_PROGRAM_ID_STRING)
  
      const amount = Math.floor(indexTokenAmount * 10 ** AXIS_DECIMALS)
  
      // Token-2022 の ATA は programId を必ず指定（重要）。:contentReference[oaicite:6]{index=6}
      const userAxisAta     = await getAssociatedTokenAddress(AXIS_MINT, this.wallet.publicKey, false, TOKEN_2022_PROGRAM_ID)
      const treasuryAxisAta = await getAssociatedTokenAddress(AXIS_MINT, TREASURY,             false, TOKEN_2022_PROGRAM_ID)
  
      const ixTransferChecked = createTransferCheckedInstruction(
        userAxisAta, AXIS_MINT, treasuryAxisAta, this.wallet.publicKey, BigInt(amount), AXIS_DECIMALS, [], TOKEN_2022_PROGRAM_ID
      ) // Checked は mint/decimals を検証。:contentReference[oaicite:7]{index=7}
  
      const memoId = `AXIS_BURN_REQ_${Date.now()}`
      const memo = new TransactionInstruction({ keys: [], programId: MEMO_PID, data: Buffer.from(memoId, 'utf-8') })
  
      const { blockhash } = await this.connection.getLatestBlockhash()
      const msg = new TransactionMessage({
        payerKey: this.wallet.publicKey, recentBlockhash: blockhash, instructions: [ixTransferChecked, memo]
      }).compileToV0Message()
  
      return { transaction: new VersionedTransaction(msg), memoId }
    }
  }
  