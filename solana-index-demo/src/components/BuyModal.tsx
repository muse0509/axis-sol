import React, { useEffect, useMemo, useState } from 'react'
import styles from '../styles/BuyModal.module.css'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import toast from 'react-hot-toast'
import { BN } from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from '@solana/spl-token'

import {
  getProgram,
  getUserUsdcBalance,
  formatAddress,
  deriveStatePda,
  fetchState,
  TOKEN_PROGRAM,
  USDC_MINT,
} from '@/lib/anchorClient'

import NetworkGuard from './NetworkGuard'

const USDC_DECIMALS = 6

type Props = { isOpen: boolean; onClose: () => void; indexPrice: number }

const BuyModal: React.FC<Props> = ({ isOpen, onClose, indexPrice }) => {
  const { connection } = useConnection()
  const wallet = useWallet()
  const { connected, publicKey } = wallet

  const networkName = useMemo(() => (connection?.rpcEndpoint || '').toLowerCase().includes('devnet') ? 'Devnet' : 'Mainnet', [connection?.rpcEndpoint]);
  const isDevnet = networkName === 'Devnet'

  const [indexAmountUi, setIndexAmountUi] = useState('1')
  const [loading, setLoading] = useState(false)
  const [usdcBalance, setUsdcBalance] = useState<number>(0)

  const estUsdcPerIndex = useMemo(() => Math.max(0, indexPrice / 100), [indexPrice])
  const estCost = useMemo(() => {
    const qty = Number(indexAmountUi || '0')
    return !Number.isFinite(qty) || qty <= 0 ? 0 : qty * estUsdcPerIndex
  }, [indexAmountUi, estUsdcPerIndex])

  useEffect(() => {
    (async () => {
      if (!connected || !publicKey) { setUsdcBalance(0); return }
      try {
        const bal = await getUserUsdcBalance(connection, publicKey, USDC_MINT)
        setUsdcBalance(bal)
      } catch (e) { console.warn('fetch usdc balance failed:', e); setUsdcBalance(0) }
    })()
  }, [connected, publicKey, connection])

  const onMax = () => {
    if (estUsdcPerIndex <= 0) { setIndexAmountUi('0'); return }
    const max = Math.floor((usdcBalance / estUsdcPerIndex) * 1e6) / 1e6
    setIndexAmountUi(String(Math.max(0, max)))
  }

  const onMint = async () => {
    if (!connected || !publicKey) return toast.error('Connect your wallet first.')
    if (!isDevnet) return toast.error('This dApp is Devnet-only.')
  
    const usdcAmount = new BN(1 * (10 ** USDC_DECIMALS));
    const loadingId = toast.loading('Sending transaction…')
    setLoading(true)
    
    try {
      const program = getProgram(connection, wallet)
      const state = await fetchState(program);
      console.log("Fetched on-chain state:", state);
      console.log("--- Verifying Constituents Data ---");
      state.constituents.forEach((c, index) => {
        console.log(`[Constituent ${index}]`);
        console.log(`  -> Token Mint:     ${c.tokenMint.toBase58()}`);
        console.log(`  -> Pyth Price Acc: ${c.pythPriceAcc.toBase58()}`);
        console.log(`  -> Target BPS:     ${c.targetBps}`);
      });
      console.log("------------------------------------");

      if (!state.vaultUsdc || !state.vaultSol) {
        throw new Error("On-chain state is outdated. Please re-initialize the fund.");
      }

      const userUsdcAta = await getAssociatedTokenAddress(state.usdcMint, publicKey);
      const userIndexAta = await getAssociatedTokenAddress(state.indexMint, publicKey);
      console.log("User ATAs derived:", { userUsdcAta: userUsdcAta.toBase58(), userIndexAta: userIndexAta.toBase58() });

      // 修正: constituentsの順序とtargetBpsの確認を追加
      console.log("On-chain constituents order and data:");
      state.constituents.forEach((c, i) => {
        console.log(`  [${i}] mint: ${c.tokenMint.toBase58()}, target_bps: ${c.targetBps}, pyth: ${c.pythPriceAcc.toBase58()}`);
      });

      // 修正: targetBps > 0 の条件を削除し、on-chainの順序通りにremainingAccountsを構築
      const remainingAccounts = state.constituents.map(c => ({
        pubkey: c.pythPriceAcc,
        isSigner: false,
        isWritable: false,
      }));
      
      console.log("Constructed remainingAccounts in exact on-chain order:");
      remainingAccounts.forEach((acc, i) => {
        console.log(`  [${i}] ${acc.pubkey.toBase58()}`);
      });

      // Pythアカウントの存在確認を追加
      console.log("Verifying Pyth accounts exist...");
      for (let i = 0; i < remainingAccounts.length; i++) {
        try {
          const accountInfo = await connection.getAccountInfo(remainingAccounts[i].pubkey);
          console.log(`Pyth account [${i}] ${remainingAccounts[i].pubkey.toBase58()}: ${accountInfo ? 'EXISTS' : 'NOT FOUND'}`);
          if (accountInfo) {
            console.log(`  Owner: ${accountInfo.owner.toBase58()}`);
            console.log(`  Data length: ${accountInfo.data.length}`);
          }
        } catch (error) {
          console.error(`Error checking Pyth account [${i}]:`, error);
        }
      }

      const ataInstructions = [];
      const userUsdcAtaInfo = await connection.getAccountInfo(userUsdcAta);
      if (!userUsdcAtaInfo) {
        ataInstructions.push(
          createAssociatedTokenAccountInstruction(publicKey, userUsdcAta, publicKey, state.usdcMint)
        );
      }
      const userIndexAtaInfo = await connection.getAccountInfo(userIndexAta);
      if (!userIndexAtaInfo) {
        ataInstructions.push(
          createAssociatedTokenAccountInstruction(publicKey, userIndexAta, publicKey, state.indexMint)
        );
      }

      const signature = await program.methods
        .depositAndMint(usdcAmount)
        .accounts({
          state: deriveStatePda()[0],
          user: publicKey,
          userUsdcAta: userUsdcAta,
          userIndexAta: userIndexAta,
          vaultUsdc: state.vaultUsdc,
          vaultSol: state.vaultSol,
          indexMint: state.indexMint,
          tokenProgram: TOKEN_PROGRAM,
        })
        .remainingAccounts(remainingAccounts)
        .preInstructions(ataInstructions)
        .rpc();
  
      console.log('Transaction signature:', signature)
      toast.success('Successfully sent depositAndMint transaction!')
      
      const bal = await getUserUsdcBalance(connection, publicKey, state.usdcMint)
      setUsdcBalance(bal)
      
    } catch (e: any) {
      console.error('[mint failed]', e)
      const errorMessage = e?.error?.errorMessage || e?.message || 'Transaction failed';
      if (!/re-initialize/i.test(errorMessage)) {
        toast.error(errorMessage);
      }
    } finally {
      toast.dismiss(loadingId)
      setLoading(false)
    }
  }
  
  if (!isOpen) return null

  return (
    <NetworkGuard>
      <div className={styles.backdrop} role="dialog" aria-modal="true">
        <div className={styles.modal}>
          <div className={styles.header}>
            <div className={styles.statusBar}>
              <span className={`${styles.dot} ${connected ? styles.dotOn : styles.dotOff}`} />
              <span className={styles.statusText}>
                {connected && publicKey ? `Connected: ${formatAddress(publicKey)}` : 'Wallet not connected'}
              </span>
              <span className={styles.networkBadge}>{networkName}</span>
            </div>
            <button className={styles.close} onClick={onClose} aria-label="Close">×</button>
          </div>
          <div className={styles.body}>
            {!connected ? (
              <div className={styles.centerBox}>
                <p className={styles.connectHint}>Connect your wallet on <b>Devnet</b> to mint the index token.</p>
                <div className={styles.walletBtnWrap}><WalletMultiButton className={styles.walletBtn} /></div>
              </div>
            ) : (
              <>
                <div className={styles.row}>
                  <label className={styles.label}>Amount (USDC)</label>
                  <div className={styles.amountWrap}>
                    <input className={styles.input} inputMode="decimal" value={indexAmountUi} onChange={(e) => setIndexAmountUi(e.target.value)} placeholder="1.0" aria-label="USDC amount to deposit" />
                    <button className={styles.maxBtn} onClick={onMax} type="button">Max</button>
                    <button className={styles.mintBtn} onClick={onMint} disabled={loading} type="button">
                      {loading ? 'Processing…' : 'Buy'}
                    </button>
                  </div>
                </div>
                <div className={styles.grid}>
                  <div className={styles.card}>
                    <div className={styles.kv}><span>Estimated Index Price</span><strong>${estUsdcPerIndex.toFixed(2)}</strong></div>
                    <div className={styles.kv}><span>Estimated Cost</span><strong>${estCost.toFixed(2)}</strong></div>
                  </div>
                  <div className={styles.card}>
                    <div className={styles.kv}><span>Your USDC (Devnet)</span>
                      <strong>{usdcBalance.toLocaleString(undefined, { maximumFractionDigits: 6 })}</strong></div>
                    <div className={styles.kvSub}>Make sure you hold some SOL for network fees.</div>
                  </div>
                </div>
                <p className={styles.note}>
                  This is a test transaction. It will deposit 1 USDC and attempt to mint the index token based on the on-chain NAV.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </NetworkGuard>
  )
}

export default BuyModal