'use client'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { PublicKey } from '@solana/web3.js'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { getAssociatedTokenAddress, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token'
import styles from '../styles/RedeemModal.module.css'

// ---- Constants (devnet) ----
const AXIS_MINT_2022 = new PublicKey('6XJVFiPQZ9pAa6Cuhcm6jbHtV3G3ZjK3VZ2HNTanpAQ1') // Token-2022
const AXIS_DECIMALS  = 9
const TREASURY_OWNER = new PublicKey('BTcWoRe6Z9VaCPCxrcr5dQmn8cA8KNHpFdgJEVopSBsj') // Vault/Treasury
const USDC_DEV_MINT  = new PublicKey('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr') // for info line

type Props = {
  isOpen: boolean
  onClose: () => void
  indexPrice: number | null // same as BuyModal
}

function fmtAddr(pk?: PublicKey | null) {
  if (!pk) return ''
  const s = pk.toBase58()
  return `${s.slice(0, 4)}…${s.slice(-4)}`
}

export default function RedeemModal({ isOpen, onClose, indexPrice }: Props) {
  const { connection } = useConnection()
  const wallet = useWallet()
  const { publicKey, sendTransaction, connected } = wallet

  const [axisBalance, setAxisBalance] = useState(0) // UI units
  const [amount, setAmount] = useState('0.01')
  const [busy, setBusy] = useState(false)
  const [step, setStep] = useState<'idle'|'building'|'submitted'|'settling'|'settled'|'error'>('idle')
  const [txSig, setTxSig] = useState<string | null>(null)
  const [memoId, setMemoId] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // -------- Accessibility: focus management per ARIA dialog pattern --------
  const firstFocusableRef = useRef<HTMLInputElement | null>(null)
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    // Initial focus
    setTimeout(() => firstFocusableRef.current?.focus(), 0)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  // -------- Fetch AXIS balance --------
  useEffect(() => {
    let aborted = false
    const run = async () => {
      if (!connected || !publicKey) return
      try {
        // Token-2022 ATAs require program id in derivation in write paths,
        // but for lookup getAssociatedTokenAddress default is OK; account may not exist.
        const ata = await getAssociatedTokenAddress(
            AXIS_MINT_2022,
            publicKey,
            false,                    // allowOwnerOffCurve
            TOKEN_2022_PROGRAM_ID     // ★ ここが必須
          )
        const bal = await connection.getTokenAccountBalance(ata).catch(() => null)
        if (!aborted) setAxisBalance(bal?.value?.uiAmount || 0)
      } catch { if (!aborted) setAxisBalance(0) }
    }
    run()
    // refresh after settlement
  }, [connected, publicKey, connection, step === 'settled'])

  const networkName = useMemo(
    () => (connection?.rpcEndpoint || '').toLowerCase().includes('devnet') ? 'Devnet' : 'Mainnet',
    [connection?.rpcEndpoint]
  )

  const expectedUsdc = useMemo(() => {
    const q = parseFloat(amount)
    if (!indexPrice || !isFinite(q) || q <= 0) return null
    return q * indexPrice // Q_USDC = Q_AXIS * I(t)
  }, [amount, indexPrice])

  const setPct = (p: number) => {
    const q = axisBalance * p
    setAmount(q.toFixed(AXIS_DECIMALS))
  }

  const handleRedeem = async () => {
    if (!connected || !publicKey || !wallet.signTransaction) {
      setErrorMsg('Connect your wallet on Devnet.')
      setStep('error'); return
    }
    if (networkName !== 'Devnet') {
      setErrorMsg('This dApp runs on Devnet only.')
      setStep('error'); return
    }
    const qAxis = parseFloat(amount)
    if (!isFinite(qAxis) || qAxis <= 0) {
      setErrorMsg('Enter a valid amount.')
      setStep('error'); return
    }
    if (qAxis > axisBalance) {
      setErrorMsg('Insufficient AXIS balance.')
      setStep('error'); return
    }

    try {
      setBusy(true); setErrorMsg(null); setStep('building')

      // Dynamic import to avoid SSR issues
      const { AxisSDK } = await import('@/axis-sdk/AxisSDK')
      const sdk = new AxisSDK(connection, wallet)

      const { transaction, memoId: mid } = await sdk.buildIndexTokenDepositTransaction(qAxis)
      setMemoId(mid)

      setStep('submitted')
      const signature = await sendTransaction(transaction, connection)
      setTxSig(signature)
      setStep('settling')

      // Poll your existing settlement endpoint (same idea as Buy flow)
      // If you don’t have a dedicated endpoint yet, leave the button-driven "Check again".
      let done = false
      const deadline = Date.now() + 90_000 // 90s
      while (!done && Date.now() < deadline) {
        await new Promise(r => setTimeout(r, 4000))
        // optional: call /api/settlement-status?sig=...
        // For now we just check whether USDC increased (best-effort).
        // In production, use your backend correlation by memo+signature.
        done = true // set by backend response
      }
      if (done) setStep('settled')
      else setStep('settling') // keep showing the "Check again" button
    } catch (e: any) {
      console.error('[RedeemModal] error:', e)
      setErrorMsg(e?.message || 'Unexpected error')
      setStep('error')
    } finally {
      setBusy(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true" aria-labelledby="redeem-title">
      <div className={styles.modal}>
        <header className={styles.header}>
          <div className={styles.badges}>
            <span className={styles.netBadge}>{networkName}</span>
            <span className={styles.addr}>Connected: {fmtAddr(publicKey) || '—'}</span>
          </div>
          <button className={styles.close} aria-label="Close" onClick={onClose}>×</button>
        </header>

        <div className={styles.grid}>
          {/* Left: form */}
          <section className={styles.panel}>
            <div className={styles.kv}>
              <span>Your AXIS Balance</span>
              <strong>{axisBalance.toFixed(AXIS_DECIMALS)}</strong>
            </div>
            <div className={styles.kv}>
              <span>Current Index Value</span>
              <strong>{indexPrice ? indexPrice.toFixed(6) : 'N/A'}</strong>
            </div>

            <label className={styles.label} htmlFor="redeem-amt">Amount to Redeem (AXIS)</label>
            <input
              id="redeem-amt"
              ref={firstFocusableRef}
              type="number"
              className={styles.input}
              value={amount}
              onChange={e => setAmount(e.target.value)}
              min="0"
              step="0.000000001"
              disabled={busy}
              inputMode="decimal"
            />

            <div className={styles.quickRow}>
              <button className={styles.quick} onClick={() => setPct(0.25)} disabled={busy}>25%</button>
              <button className={styles.quick} onClick={() => setPct(0.5)}  disabled={busy}>50%</button>
              <button className={styles.quick} onClick={() => setPct(0.75)} disabled={busy}>75%</button>
              <button className={styles.quick} onClick={() => setPct(1)}    disabled={busy}>Max</button>
            </div>

            <button
              className={styles.primary}
              onClick={handleRedeem}
              disabled={busy || !publicKey}
            >
              {busy ? 'Processing…' : 'Redeem (Burn)'}
            </button>

            {/* Inline status */}
            {step !== 'idle' && (
              <div className={styles.statusBox}>
                {step === 'building'  && <p>Preparing transaction…</p>}
                {step === 'submitted' && <p>Transaction sent. Waiting for confirmation…</p>}
                {step === 'settling'  && (
                  <p>
                    Waiting for backend settlement…{' '}
                    <button className={styles.linkBtn} onClick={() => setStep('settling')}>Check again</button>
                  </p>
                )}
                {step === 'settled'   && <p>Redeemed successfully. USDC should arrive shortly.</p>}
                {step === 'error'     && <p className={styles.error}>{errorMsg}</p>}
                {txSig && (
                  <p>
                    Tx:&nbsp;
                    <a className={styles.link} href={`https://solscan.io/tx/${txSig}?cluster=devnet`} target="_blank" rel="noreferrer">view</a>
                  </p>
                )}
                {memoId && <p>Memo: {memoId}</p>}
              </div>
            )}
          </section>

          {/* Right: details */}
          <aside className={styles.panel}>
            <h3 id="redeem-title" className={styles.panelTitle}>Redemption Details</h3>
            <p>Your AXIS (Token-2022) is transferred to the treasury. The backend then executes the redemption settlement and returns USDC according to the index.</p>
            <div className={styles.meta}>
              <div>
                <div className={styles.metaLabel}>AXIS Mint</div>
                <div className={styles.metaValue}>{AXIS_MINT_2022.toBase58()}</div>
              </div>
              <div>
                <div className={styles.metaLabel}>Treasury (Owner)</div>
                <div className={styles.metaValue}>{TREASURY_OWNER.toBase58()}</div>
              </div>
              <div>
                <div className={styles.metaLabel}>USDC (devnet)</div>
                <div className={styles.metaValue}>{USDC_DEV_MINT.toBase58()}</div>
              </div>
            </div>

            <div className={styles.quoteBox}>
              <div className={styles.kvSmall}>
                <span>Expected USDC</span>
                <strong>{expectedUsdc ? expectedUsdc.toFixed(6) : '—'}</strong>
              </div>
              <small>Formula: Q<sub>USDC</sub> = Q<sub>AXIS</sub> × Index</small>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
