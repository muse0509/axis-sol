// /components/TxStatusModal.tsx
'use client'
import React, { useEffect, useMemo, useState } from 'react'
import styles from '../styles/TxStatusModal.module.css'
import { PublicKey } from '@solana/web3.js'
import { getAssociatedTokenAddress, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token'

type Props = {
  open: boolean
  onClose: () => void
  connection: any
  user: PublicKey
  axisMint: PublicKey
  axisDecimals: number
  initialAxisBalance: number
  expectedAxis: number
  usdcSignature: string
  memoId: string
}

export default function TxStatusModal({
  open, onClose, connection, user, axisMint, axisDecimals,
  initialAxisBalance, expectedAxis, usdcSignature, memoId
}: Props) {
  const [axisReceived, setAxisReceived] = useState(0)
  const [status, setStatus] = useState<'waiting'|'received'|'timeout'|'error'>('waiting')
  const [err, setErr] = useState<string>('')

  const explorerUrl = useMemo(
    () => `https://solscan.io/tx/${usdcSignature}?cluster=devnet`,
    [usdcSignature]
  )

  useEffect(() => {
    if (!open) return
    let mounted = true
    ;(async () => {
      try {
        console.group('[SettlementWatcher]')
        console.debug('memoId:', memoId)
        console.debug('expectedAxis:', expectedAxis)
        console.debug('initialAxisBalance:', initialAxisBalance)

        const ata = await getAssociatedTokenAddress(axisMint, user, false, TOKEN_2022_PROGRAM_ID)
        // Poll every 2s up to ~90s
        const deadline = Date.now() + 90_000
        while (mounted && Date.now() < deadline) {
          const bal = await connection.getTokenAccountBalance(ata).catch(() => null)
          const ui = bal?.value?.uiAmount ?? 0
          const delta = Math.max(0, ui - initialAxisBalance)
          console.debug('[poll] ui=', ui, 'delta=', delta)
          if (delta > 0 && delta + 1e-9 >= expectedAxis * 0.95) { // 5% tolerance
            setAxisReceived(delta)
            setStatus('received')
            console.groupEnd()
            return
          }
          await new Promise(r => setTimeout(r, 2000))
        }
        setStatus('timeout')
        console.groupEnd()
      } catch (e: any) {
        setErr(e?.message || String(e))
        setStatus('error')
        console.groupEnd()
      }
    })()
    return () => { mounted = false }
  }, [open])

  if (!open) return null

  return (
    <div className={styles.backdrop}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.title}>Order Settlement</div>
          <button className={styles.close} onClick={onClose}>×</button>
        </div>

        <div className={styles.body}>
          <ol className={styles.stepper}>
            <li className={styles.stepDone}>
              <div className={styles.stepTitle}>USDC payment sent</div>
              <a className={styles.link} href={explorerUrl} target="_blank" rel="noreferrer">View transaction</a>
              <div className={styles.meta}><span>Memo:</span> <code>{memoId}</code></div>
            </li>

            <li className={status === 'received' ? styles.stepDone : styles.stepActive}>
              <div className={styles.stepTitle}>
                {status === 'received' ? 'AXIS delivered' : 'Waiting for settlement (backend)'}
              </div>
              <div className={styles.meta}>
                <span>Expected:</span> <b>{expectedAxis.toFixed(6)}</b> AXIS
                {status === 'received' && (<>
                  &nbsp;|&nbsp;<span>Received:</span> <b>{axisReceived.toFixed(6)}</b> AXIS
                </>)}
              </div>
            </li>

            <li className={
              status === 'received' ? styles.stepDone :
              status === 'timeout'  ? styles.stepFailed : styles.stepIdle
            }>
              <div className={styles.stepTitle}>
                {status === 'received' ? 'Completed' : status === 'timeout' ? 'Timeout' : 'Finalizing'}
              </div>
              {status === 'timeout' && (
                <div className={styles.note}>
                  Didn’t see the tokens within the expected window.  
                  Keep this window open and try “Check again”, or contact support with the memo and signature.
                </div>
              )}
              {status === 'error' && <div className={styles.note}>Error: {err}</div>}
            </li>
          </ol>
        </div>

        <div className={styles.footer}>
          <button className={styles.secondary} onClick={()=>{
            navigator.clipboard?.writeText(JSON.stringify({ memoId, usdcSignature, expectedAxis }))
          }}>Copy debug info</button>

          <button className={styles.primary} onClick={onClose}>
            {status === 'received' ? 'Close' : 'Close anyway'}
          </button>
        </div>
      </div>
    </div>
  )
}
