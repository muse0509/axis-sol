'use client'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { PublicKey } from '@solana/web3.js'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { getAssociatedTokenAddress } from '@solana/spl-token'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import SettlementModal from './SettlementModal'
// 注目: スタイルファイルをRedeemModalのものに変更
import styles from '../styles/RedeemModal.module.css' 

// ---- Constants (devnet) ----
const USDC_MINT = new PublicKey('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr')
const TREASURY_USDC_ATA = new PublicKey('GPrfbGCK2rBEYL2jy7mMq9pYBht1tTss6ZfLUwU1jxrB')
const AXIS_MINT_2022 = new PublicKey('6XJVFiPQZ9pAa6Cuhcm6jbHtV3G3ZjK3VZ2HNTanpAQ1') // 参考情報用

// ---- Helpers ----
const fmtAddr = (pk?: PublicKey | null) => {
  if (!pk) return ''
  const s = pk.toBase58()
  return `${s.slice(0, 4)}…${s.slice(-4)}`
}

async function getUserUsdcBalance(conn: any, owner: PublicKey) {
  try {
    const ata = await getAssociatedTokenAddress(USDC_MINT, owner)
    const bal = await conn.getTokenAccountBalance(ata)
    return bal.value.uiAmount || 0
  } catch { return 0 }
}

export default function BuyModal({ isOpen, onClose, indexPrice }: { isOpen: boolean; onClose: () => void; indexPrice: number | null }) {
  const { connection } = useConnection()
  const wallet = useWallet()
  const { publicKey, sendTransaction, connected } = wallet

  const [usdcBalance, setUsdcBalance] = useState(0)
  const [amount, setAmount] = useState('10.0') // `qty`から`amount`に改名
  const [busy, setBusy] = useState(false) // `loading`から`busy`に改名

  // settlement modal state
  const [settleOpen, setSettleOpen] = useState(false)
  const [depositSig, setDepositSig] = useState<string>()
  const [memoId, setMemoId] = useState<string>()

  // --- Accessibility & Focus Management ---
  const firstFocusableRef = useRef<HTMLInputElement | null>(null)
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    setTimeout(() => firstFocusableRef.current?.focus(), 0)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  const networkName = useMemo(
    () => (connection?.rpcEndpoint || '').toLowerCase().includes('devnet') ? 'Devnet' : 'Mainnet',
    [connection?.rpcEndpoint]
  )

  // --- Fetch USDC balance ---
  useEffect(() => {
    if (publicKey && isOpen) {
      getUserUsdcBalance(connection, publicKey).then(setUsdcBalance)
    }
    // loading/busy状態が解除された後にも残高を更新
  }, [publicKey, connection, isOpen, busy])

  const expectedAxis = useMemo(() => {
    const q = parseFloat(amount)
    if (!indexPrice || !isFinite(q) || q <= 0) return null
    return q / indexPrice // Q_AXIS = Q_USDC / I(t)
  }, [amount, indexPrice])

  const setPct = (p: number) => {
    const value = usdcBalance * p
    setAmount(value.toFixed(6)) // USDCは6桁の精度が一般的
  }

  const handleBuy = async () => {
    if (!connected || !publicKey || !wallet.signTransaction) return alert('Please connect your wallet.')
    if (networkName !== 'Devnet') return alert('This dApp runs on Devnet only.')

    const usdcAmount = parseFloat(amount)
    if (!isFinite(usdcAmount) || usdcAmount <= 0) return alert('Please enter a valid amount.')
    if (usdcAmount > usdcBalance) return alert('Insufficient USDC balance.')

    try {
      setBusy(true)
      const { AxisSDK } = await import('@axis-protocol/sdk')
      const sdk = new AxisSDK(connection, wallet as any)
      
      const { transaction, memoId: mid } = await sdk.buildUsdcDepositTransaction(usdcAmount)
      setMemoId(mid)
      
      const signature = await sendTransaction(transaction, connection)
      setDepositSig(signature)
      setSettleOpen(true) // Open settlement progress modal

      // You can await confirmation here if needed, but the settlement modal handles the user view
      await connection.confirmTransaction(signature, 'confirmed')

    } catch (e: any) {
      console.error('[BuyModal] handleBuy error:', e)
      alert(e?.message || 'An unexpected error occurred.')
    } finally {
      setBusy(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className={styles.backdrop} role="dialog" aria-modal="true" aria-labelledby="buy-title">
        <div className={styles.modal}>
          <header className={styles.header}>
            <div className={styles.badges}>
              <span className={styles.netBadge}>{networkName}</span>
              <span className={styles.addr}>Connected: {fmtAddr(publicKey) || '—'}</span>
            </div>
            <button className={styles.close} aria-label="Close" onClick={onClose}>×</button>
          </header>

          <div className={styles.grid}>
            {/* Left: form (RedeemModalの構成に合わせる) */}
            <section className={styles.panel}>
              <div className={styles.kv}>
                <span>Your USDC Balance</span>
                <strong>{usdcBalance.toFixed(6)}</strong>
              </div>
              <div className={styles.kv}>
                <span>Current Index Price</span>
                <strong>{indexPrice ? `$${indexPrice.toFixed(4)}` : 'N/A'}</strong>
              </div>

              <label className={styles.label} htmlFor="buy-amt">Amount to Spend (USDC)</label>
              <input
                id="buy-amt"
                ref={firstFocusableRef}
                type="number"
                className={styles.input}
                value={amount}
                onChange={e => setAmount(e.target.value)}
                min="0"
                step="0.01"
                disabled={busy || !connected}
                inputMode="decimal"
              />

              <div className={styles.quickRow}>
                <button className={styles.quick} onClick={() => setPct(0.25)} disabled={busy || !connected}>25%</button>
                <button className={styles.quick} onClick={() => setPct(0.5)}  disabled={busy || !connected}>50%</button>
                <button className={styles.quick} onClick={() => setPct(0.75)} disabled={busy || !connected}>75%</button>
                <button className={styles.quick} onClick={() => setPct(1)}    disabled={busy || !connected}>Max</button>
              </div>

              {connected ? (
                <button
                  className={styles.primary}
                  onClick={handleBuy}
                  disabled={busy || !publicKey}
                >
                  {busy ? 'Processing…' : 'Buy AXIS'}
                </button>
              ) : (
                <div style={{marginTop: '1rem'}}><WalletMultiButton /></div>
              )}
            </section>

            {/* Right: details (RedeemModalの構成に合わせる) */}
            <aside className={styles.panel}>
              <h3 id="buy-title" className={styles.panelTitle}>Purchase Details</h3>
              <p>Your USDC is transferred to the treasury. The backend then settles the order and mints new AXIS tokens to your wallet.</p>
              
              <div className={styles.meta}>
                <div>
                  <div className={styles.metaLabel}>Receiving Token (AXIS)</div>
                  <div className={styles.metaValue}>{AXIS_MINT_2022.toBase58()}</div>
                </div>
                <div>
                  <div className={styles.metaLabel}>Treasury USDC ATA</div>
                  <div className={styles.metaValue}>{TREASURY_USDC_ATA.toBase58()}</div>
                </div>
                 <div>
                  <div className={styles.metaLabel}>Spending Token (USDC)</div>
                  <div className={styles.metaValue}>{USDC_MINT.toBase58()}</div>
                </div>
              </div>

              <div className={styles.quoteBox}>
                <div className={styles.kvSmall}>
                  <span>Expected AXIS</span>
                  <strong>{expectedAxis ? `~ ${expectedAxis.toFixed(6)}` : '—'}</strong>
                </div>
                <small>Formula: Q<sub>AXIS</sub> = Q<sub>USDC</sub> / Index</small>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* SettlementModalはそのまま利用 */}
      <SettlementModal
        open={settleOpen}
        onClose={() => setSettleOpen(false)}
        depositSig={depositSig!}
        memoId={memoId}
        expectedText={expectedAxis ? `~ ${expectedAxis.toFixed(6)} AXIS` : undefined}
        explorerBase="https://solscan.io"
      />
    </>
  )
}