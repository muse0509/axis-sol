import {
    Connection,
    PublicKey,
    VersionedTransaction,
    TransactionMessage,
    TransactionInstruction,
    SystemProgram,
  } from '@solana/web3.js';
  import { getAssociatedTokenAddress, createTransferInstruction } from '@solana/spl-token';
  
  // --- 定数定義 ---
  const TREASURY_WALLET_ADDRESS_STRING = 'BTcWoRe6Z9VaCPCxrcr5dQmn8cA8KNHpFdgJEVopSBsj';
  const INDEX_TOKEN_MINT_STRING = 'ByThBJkZGa9eCXjyyubHUSpK9oqG2A3QyYt5zcAdF7N5';
  const USDC_MINT_STRING = 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr';
  // 修正: 正しいMemo Program IDを使用
  const MEMO_PROGRAM_ID_STRING = 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'
  
  export class AxisSDK {
    constructor(connection, wallet) {
      if (!connection || !wallet) {
        throw new Error('Connection and Wallet must be provided.');
      }
      this.connection = connection;
      this.wallet = wallet;
    }
  
    /**
     * 【Mint用】ユーザーがUSDCをTreasuryに送金するためのトランザクションを構築する
     * @param {number} usdcAmount - ユーザーが支払うUSDCの量
     * @returns {Promise<VersionedTransaction>} - 署名・送信するためのトランザクション
     */
    async buildUsdcDepositTransaction(usdcAmount) {
      if (!this.wallet.publicKey) {
        throw new Error('Wallet is not connected.');
      }
  
      console.log('[AxisSDK-Debug] Entering buildUsdcDepositTransaction...');
      
      let TREASURY_WALLET_ADDRESS, USDC_MINT, MEMO_PROGRAM_ID;
  
      try {
          console.log(`[AxisSDK-Debug] 1. Creating TREASURY_WALLET_ADDRESS...`);
          TREASURY_WALLET_ADDRESS = new PublicKey(TREASURY_WALLET_ADDRESS_STRING);
          console.log('[AxisSDK-Debug]    ✅ TREASURY_WALLET_ADDRESS created successfully.');
      } catch (e) {
          console.error('[AxisSDK-Debug]    ❌ FATAL: Failed to create TREASURY_WALLET_ADDRESS.', e);
          throw e;
      }
  
      try {
          console.log(`[AxisSDK-Debug] 2. Creating USDC_MINT...`);
          USDC_MINT = new PublicKey(USDC_MINT_STRING);
          console.log('[AxisSDK-Debug]    ✅ USDC_MINT created successfully.');
      } catch (e) {
          console.error('[AxisSDK-Debug]    ❌ FATAL: Failed to create USDC_MINT.', e);
          throw e;
      }
  
      try {
          console.log(`[AxisSDK-Debug] 3. Creating MEMO_PROGRAM_ID...`);
          MEMO_PROGRAM_ID = new PublicKey(MEMO_PROGRAM_ID_STRING);
          console.log('[AxisSDK-Debug]    ✅ MEMO_PROGRAM_ID created successfully.');
      } catch (e) {
          console.error('[AxisSDK-Debug]    ❌ FATAL: Failed to create MEMO_PROGRAM_ID.', e);
          throw e;
      }
  
      const amountInSmallestUnit = Math.floor(usdcAmount * (10 ** 6));
  
      const userUsdcAta = await getAssociatedTokenAddress(USDC_MINT, this.wallet.publicKey);
      const treasuryUsdcAta = await getAssociatedTokenAddress(USDC_MINT, TREASURY_WALLET_ADDRESS);
      
      const transferInstruction = createTransferInstruction(
        userUsdcAta,
        treasuryUsdcAta,
        this.wallet.publicKey,
        amountInSmallestUnit
      );
  
      const uniqueId = `AXIS_MINT_REQ_${Date.now()}`;
      const memoInstruction = new TransactionInstruction({
          keys: [],
          programId: MEMO_PROGRAM_ID,
          data: Buffer.from(uniqueId, "utf-8"),
      });
  
      const { blockhash } = await this.connection.getLatestBlockhash();
  
      const messageV0 = new TransactionMessage({
        payerKey: this.wallet.publicKey,
        recentBlockhash: blockhash,
        instructions: [
          transferInstruction,
          memoInstruction
        ],
      }).compileToV0Message();
  
      return new VersionedTransaction(messageV0);
    }
  
    /**
     * 【Burn用】ユーザーがIndexTokenをTreasuryに送金するためのトランザクションを構築する
     * @param {number} indexTokenAmount - ユーザーがBurnしたいIndexTokenの量
     * @returns {Promise<VersionedTransaction>} - 署名・送信するためのトランザクション
     */
    async buildIndexTokenDepositTransaction(indexTokenAmount) {
      if (!this.wallet.publicKey) {
        throw new Error('Wallet is not connected.');
      }
  
      const TREASURY_WALLET_ADDRESS = new PublicKey(TREASURY_WALLET_ADDRESS_STRING);
      const INDEX_TOKEN_MINT = new PublicKey(INDEX_TOKEN_MINT_STRING);
      const MEMO_PROGRAM_ID = new PublicKey(MEMO_PROGRAM_ID_STRING);
  
      const indexTokenDecimals = 9;
      const amountInSmallestUnit = Math.floor(indexTokenAmount * (10 ** indexTokenDecimals));
  
      const userIndexTokenAta = await getAssociatedTokenAddress(INDEX_TOKEN_MINT, this.wallet.publicKey);
      const treasuryIndexTokenAta = await getAssociatedTokenAddress(INDEX_TOKEN_MINT, TREASURY_WALLET_ADDRESS);
  
      const transferInstruction = createTransferInstruction(
        userIndexTokenAta,
        treasuryIndexTokenAta,
        this.wallet.publicKey,
        amountInSmallestUnit
      );
  
      const uniqueId = `AXIS_BURN_REQ_${Date.now()}`;
      const memoInstruction = new TransactionInstruction({
          keys: [],
          programId: MEMO_PROGRAM_ID,
          data: Buffer.from(uniqueId, "utf-8"),
      });
  
      const { blockhash } = await this.connection.getLatestBlockhash();
      
      const messageV0 = new TransactionMessage({
        payerKey: this.wallet.publicKey,
        recentBlockhash: blockhash,
        instructions: [transferInstruction, memoInstruction],
      }).compileToV0Message();
  
      return new VersionedTransaction(messageV0);
    }
  }