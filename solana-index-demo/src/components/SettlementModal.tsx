'use client'
import React, { useEffect, useState } from 'react'
import styles from '../styles/SettlementModal.module.css'

type Props = {
  open: boolean
  onClose: () => void
  depositSig: string
  memoId?: string
  expectedText?: string // 例: "Expected: 0.03988 AXIS"
  explorerBase?: string // devnet solscan
}
type Phase = 'pending' | 'paid' | 'failed'
type Record = {
  phase: Phase
  side: 'mint' | 'burn'
  payoutSig?: string
  error?: string
}

export default function SettlementModal({ open, onClose, depositSig, memoId, expectedText, explorerBase='https://solscan.io' }: Props) {
  const [phase, setPhase] = useState<Phase>('pending')
  const [payoutSig, setPayoutSig] = useState<string>()
  const [error, setError] = useState<string>()
  const [since, setSince] = useState<number>(Date.now())

  useEffect(() => {
    if (!open || !depositSig) return
    let stop = false
    const poll = async () => {
      try {
        const r = await fetch(`/api/settlements/${depositSig}`).then(r=>r.json())
        const rec: Record | null = r?.record ?? null
        if (rec) {
          setPhase(rec.phase)
          setPayoutSig(rec.payoutSig)
          setError(rec.error)
          if (rec.phase !== 'pending') return // 完了
        }
      } catch {}
      if (!stop) setTimeout(poll, 2000)
    }
    poll()
    return () => { stop = true }
  }, [open, depositSig])

  if (!open) return null
  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <header className={styles.header}>
          <div className={styles.title}>Order Settlement</div>
          <button className={styles.close} onClick={onClose}>×</button>
        </header>

        <div className={styles.body}>
          <div className={styles.row}><span>USDC payment</span>
            <a className={styles.link} href={`${explorerBase}/tx/${depositSig}?cluster=devnet`} target="_blank" rel="noreferrer">View transaction</a></div>
          {memoId && <div className={styles.row}><span>Memo</span><code className={styles.code}>{memoId}</code></div>}
          {expectedText && <div className={styles.row}><span>Quote</span><b>{expectedText}</b></div>}

          {phase === 'pending' && <div className={styles.statePending}>
            <div className={styles.spinner} /><div>Waiting for settlement (backend)...</div>
          </div>}

          {phase === 'paid' && <div className={styles.stateOk}>
            <div className={styles.big}>✅ Settled</div>
            {payoutSig && <a className={styles.link} href={`${explorerBase}/tx/${payoutSig}?cluster=devnet`} target="_blank" rel="noreferrer">View payout</a>}
          </div>}

          {phase === 'failed' && <div className={styles.stateErr}>
            <div className={styles.big}>⚠️ Failed</div>
            <div className={styles.errText}>{error || 'Unknown error'}</div>
          </div>}
        </div>

        <footer className={styles.footer}>
          {phase === 'pending'
            ? <button className={styles.secondary} onClick={()=>setSince(Date.now())}>Check again</button>
            : <button className={styles.primary} onClick={onClose}>Close</button>}
        </footer>
      </div>
    </div>
  )
}
