'use client'
import React, { useEffect, useMemo, useState } from 'react'
import { PublicKey } from '@solana/web3.js'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import toast from 'react-hot-toast'
import { getAssociatedTokenAddress } from '@solana/spl-token'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

// 【修正点】ここでの静的インポートを削除します。
// import { AxisSDK } from '@/axis-sdk/AxisSDK' 
import NetworkGuard from './NetworkGuard'
import styles from '../styles/BuyModal.module.css'

// 定数
const USDC_MINT = new PublicKey('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr')

// 共通のヘルパー関数
const formatAddress = (publicKey) => {
  if (!publicKey) return ''
  const base58 = publicKey.toBase58()
  return `${base58.slice(0, 4)}…${base58.slice(-4)}`
}

const getUserUsdcBalance = async (connection, publicKey, usdcMint) => {
  try {
    const ata = await getAssociatedTokenAddress(usdcMint, publicKey)
    const balance = await connection.getTokenAccountBalance(ata)
    return balance.value.uiAmount || 0
  } catch (e) {
    return 0
  }
}

// このコンポーネントは、dashboard.tsxから以下のpropsを受け取ることを想定
// - isOpen: boolean
// - onClose: () => void
// - indexPrice: number | null (現在の指数価格)
export default function BuyModal({ isOpen, onClose, indexPrice }) {
  const { connection } = useConnection()
  const { publicKey, sendTransaction, connected } = useWallet()
  const wallet = useWallet() // SDKはwalletオブジェクト全体を必要とする

  const [usdcBalance, setUsdcBalance] = useState(0)
  const [qty, setQty] = useState('10') // ユーザーが入力するUSDCの量
  const [loading, setLoading] = useState(false)

  const networkName = useMemo(() => (connection?.rpcEndpoint || '').toLowerCase().includes('devnet') ? 'Devnet' : 'Mainnet', [connection?.rpcEndpoint]);

  // USDC残高の取得
  useEffect(() => {
    if (!publicKey || !connection || !isOpen) return
    
    const fetchBalance = async () => {
      const bal = await getUserUsdcBalance(connection, publicKey, USDC_MINT)
      setUsdcBalance(bal)
    }

    fetchBalance()
  }, [publicKey, connection, isOpen, loading])

  // --- イベントハンドラ ---
  const handleMint = async () => {
    if (!connected || !publicKey || !wallet.signTransaction) {
      toast.error('ウォレットを接続してください。')
      return
    }
    
    if (networkName !== 'Devnet') {
      toast.error('このdAppはDevnet専用です。')
      return
    }

    const usdcAmount = parseFloat(qty)
    if (isNaN(usdcAmount) || usdcAmount <= 0) {
      toast.error('有効な数量を入力してください')
      return
    }
    
    if (usdcAmount > usdcBalance) {
      toast.error('USDC残高が不足しています')
      return
    }
    
    setLoading(true)
    const loadingToast = toast.loading('USDC送金のトランザクションを準備中...')

    try {
      // 【修正点】SDKをクライアントサイドでのみ動的にインポートする
      const { AxisSDK } = await import('@/axis-sdk/AxisSDK');
      
      // SDKのインスタンスを作成 (walletオブジェクト全体を渡す)
      const sdk = new AxisSDK(connection, wallet)
      
      // SDKのメソッドを呼び出し、USDC送金トランザクションを構築
      const transaction = await sdk.buildUsdcDepositTransaction(usdcAmount);

      // ウォレットに署名を要求して送信
      const signature = await sendTransaction(transaction, connection);
      
      // トランザクションの完了を待つ
      toast.loading('トランザクションの承認を待っています...', { id: loadingToast });
      await connection.confirmTransaction(signature, 'confirmed');

      toast.dismiss(loadingToast)
      toast.success(
        (t) => (
          <span>
            USDCの送金が完了しました！<br/>
            バックエンドで処理後、トークンがミントされます。
            <a 
              href={`https://solscan.io/tx/${signature}?cluster=devnet`} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#88aaff', marginLeft: '8px', textDecoration: 'underline' }}
            >
              Txを見る
            </a>
          </span>
        ),
        { duration: 10000 }
      );
      console.log('USDC Deposit transaction signature:', signature)
      
      setQty('10') // 入力欄をリセット
      
    } catch (error) {
      console.error('handleMint error:', error)
      const errorMessage = error.message || '処理に失敗しました'
      toast.dismiss(loadingToast)
      toast.error(errorMessage)
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
                  <span>Current Index Value</span><strong>{indexPrice ? indexPrice.toFixed(4) : 'N/A'}</strong>
                </div>
                
                <div className={styles.row}>
                  <label>Amount to Spend (USDC)</label>
                  <div className={styles.amountWrap}>
                    <input
                      type="number"
                      className={styles.input}
                      value={qty}
                      onChange={e => setQty(e.target.value)}
                      min="0"
                      step="1"
                      disabled={loading}
                    />
                    <button
                      className={styles.mintBtn}
                      onClick={handleMint}
                      disabled={loading || !publicKey}
                    >
                      {loading ? 'Processing…' : `Deposit USDC`}
                    </button>
                  </div>
                </div>
                
                <p className={styles.note}>
                  This will transfer your USDC to the treasury. Your Index Tokens will be minted to your wallet by the backend service.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </NetworkGuard>
  )
}
