// /components/BuyModal.tsx
'use client'
import React, { useEffect, useMemo, useState } from 'react'
import { PublicKey } from '@solana/web3.js'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import toast from 'react-hot-toast'
import { getAssociatedTokenAddress } from '@solana/spl-token'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import NetworkGuard from './NetworkGuard'
import styles from '../styles/BuyModal.module.css'
import TxStatusModal from './TxStatusModal'

// consts
const USDC_MINT = new PublicKey('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr')
const AXIS_MINT = new PublicKey('6XJVFiPQZ9pAa6Cuhcm6jbHtV3G3ZjK3VZ2HNTanpAQ1')
const AXIS_DECIMALS = 9

const formatAddress = (publicKey) => !publicKey ? '' : `${publicKey.toBase58().slice(0,4)}…${publicKey.toBase58().slice(-4)}`

const getTokenUiBalance = async (connection, mint, owner, programId /* optional */) => {
  try {
    const ata = await getAssociatedTokenAddress(mint, owner, false, programId)
    const bal = await connection.getTokenAccountBalance(ata)
    return bal.value.uiAmount || 0
  } catch { return 0 }
}

export default function BuyModal({ isOpen, onClose, indexPrice }) {
  const { connection } = useConnection()
  const { publicKey, sendTransaction, connected } = useWallet()
  const wallet = useWallet()

  const [usdcBalance, setUsdcBalance] = useState(0)
  const [axisBalance, setAxisBalance] = useState(0)
  const [qty, setQty] = useState('10')
  const [loading, setLoading] = useState(false)

  const [statusOpen, setStatusOpen] = useState(false)
  const [statusMemo, setStatusMemo] = useState('')
  const [statusSig, setStatusSig]   = useState('')
  const [expectedAxis, setExpectedAxis] = useState(0)

  const networkName = useMemo(
    () => (connection?.rpcEndpoint || '').toLowerCase().includes('devnet') ? 'Devnet' : 'Mainnet',
    [connection?.rpcEndpoint]
  )

  // balances
  useEffect(() => {
    if (!publicKey || !connection || !isOpen) return
    ;(async () => {
      const [u,a] = await Promise.all([
        getTokenUiBalance(connection, USDC_MINT, publicKey, undefined),
        getTokenUiBalance(connection, AXIS_MINT, publicKey, /* Token-2022 */ undefined), // 読み取りは programId 省略でOK
      ])
      setUsdcBalance(u); setAxisBalance(a)
    })()
  }, [publicKey, connection, isOpen, loading])

  const handleMint = async () => {
    if (!connected || !publicKey || !wallet.signTransaction) {
      toast.error('Please connect your wallet.'); return
    }
    if (networkName !== 'Devnet') {
      toast.error('This dApp works on Devnet only.'); return
    }
    const usdcAmount = parseFloat(qty)
    if (isNaN(usdcAmount) || usdcAmount <= 0) {
      toast.error('Enter a valid amount'); return
    }
    if (usdcAmount > usdcBalance) {
      toast.error('Insufficient USDC balance'); return
    }

    setLoading(true)
    const loadingToast = toast.loading('Preparing transaction…')

    try {
      const { AxisSDK } = await import('@/axis-sdk/AxisSDK')
      const sdk = new AxisSDK(connection, wallet)

      // 期待 AXIS（UI 単位）= USDC / indexPrice
      const idx = Number(indexPrice || 0)
      const expAxis = idx > 0 ? (usdcAmount / idx) : 0
      setExpectedAxis(expAxis)

      console.group('[UI] handleMint')
      console.debug('usdcAmount:', usdcAmount, 'indexPrice:', idx, 'expectedAxis:', expAxis)

      const { transaction, memoId } = await sdk.buildUsdcDepositTransaction(usdcAmount)
      setStatusMemo(memoId)
      console.debug('memoId:', memoId)

      const sig = await sendTransaction(transaction, connection)
      console.debug('USDC tx signature:', sig)

      toast.dismiss(loadingToast)
      setStatusSig(sig)
      setStatusOpen(true) // ← モーダルを開く
      toast.success('Transaction sent.')

      // optional: 送金確定（confirmed）
      await connection.confirmTransaction(sig, 'confirmed')
      console.groupEnd()

    } catch (error:any) {
      console.error('handleMint error:', error)
      toast.dismiss(loadingToast)
      toast.error(error?.message || 'Failed.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <NetworkGuard>
      <div className={styles.backdrop}>
        <div className={styles.modal}>
          <header className={styles.header}>
            <div className={styles.statusBar}>
              <span className={`${styles.dot} ${connected ? styles.dotOn : styles.dotOff}`} />
              <span className={styles.statusText}>
                {connected && publicKey ? `Connected: ${formatAddress(publicKey)}` : 'Wallet not connected'}
              </span>
              <span className={styles.networkBadge}>{networkName}</span>
            </div>
            <button onClick={onClose} className={styles.close}>×</button>
          </header>

          <div className={styles.body}>
            {!connected ? (
              <div className={styles.centerBox}>
                <p className={styles.connectHint}>Connect your wallet on <b>Devnet</b> to mint the index token.</p>
                <div className={styles.walletBtnWrap}><WalletMultiButton className={styles.walletBtn} /></div>
              </div>
            ) : (
              <>
                <div className={styles.infoRow}>
                  <span>Your USDC Balance</span><strong>{usdcBalance.toFixed(6)}</strong>
                </div>
                <div className={styles.infoRow}>
                  <span>Your AXIS Balance</span><strong>{axisBalance.toFixed(6)}</strong>
                </div>
                <div className={styles.infoRow}>
                  <span>Current Index Value</span><strong>{indexPrice ? Number(indexPrice).toFixed(4) : 'N/A'}</strong>
                </div>

                <div className={styles.row}>
                  <label>Amount to Spend (USDC)</label>
                  <div className={styles.amountWrap}>
                    <input
                      type="number" className={styles.input} value={qty}
                      onChange={e => setQty(e.target.value)}
                      min="0" step="1" disabled={loading}
                    />
                    <button className={styles.mintBtn} onClick={handleMint} disabled={loading || !publicKey}>
                      {loading ? 'Processing…' : `Deposit USDC`}
                    </button>
                  </div>
                </div>

                <p className={styles.note}>
                  Your USDC goes to treasury. AXIS will be delivered by the backend shortly after settlement.
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* settlement watcher */}
      {statusOpen && publicKey && (
        <TxStatusModal
          open={statusOpen}
          onClose={() => setStatusOpen(false)}
          connection={connection}
          user={publicKey}
          axisMint={AXIS_MINT}
          axisDecimals={AXIS_DECIMALS}
          initialAxisBalance={axisBalance}
          expectedAxis={expectedAxis}
          usdcSignature={statusSig}
          memoId={statusMemo}
        />
      )}
    </NetworkGuard>
  )
}
