// components/WalletConnect.tsx
import { useEffect, useMemo, useState } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js'
import styles from '../styles/WalletConnect.module.css'

function shortAddr(pk: PublicKey | null) {
  if (!pk) return ''
  const s = pk.toBase58()
  return `${s.slice(0, 4)}…${s.slice(-4)}`
}

export default function WalletConnect() {
  const { connection }   = useConnection()
  const {
    publicKey, connected, connecting,
    connect, disconnect, wallets, wallet, select
  } = useWallet()

  const [menuOpen, setMenuOpen] = useState(false)
  const [solBalance, setSolBalance] = useState<number | null>(null)

  const network = useMemo(() => 'Devnet', []) // 固定運用（_app.tsxでdevnet固定）
  const explorer = publicKey
    ? `https://solscan.io/account/${publicKey.toBase58()}?cluster=devnet`
    : 'https://solscan.io/?cluster=devnet'

  // SOL 残高（任意表示）
  useEffect(() => {
    let sub = 0
    async function run() {
      if (!connection || !publicKey) { setSolBalance(null); return }
      try {
        const lamports = await connection.getBalance(publicKey, 'confirmed')
        setSolBalance(lamports / LAMPORTS_PER_SOL)
        // 口座変更を購読（簡易）
        sub = connection.onAccountChange(
          publicKey,
          (acc) => setSolBalance(acc.lamports / LAMPORTS_PER_SOL),
          'confirmed'
        )
      } catch {/* noop */}
    }
    run()
    return () => { if (sub) connection.removeAccountChangeListener(sub) }
  }, [connection, publicKey])

  async function handleConnect() {
    try {
      // 自前UIなので Phantom を自動選択（PhantomWalletAdapter を使っている前提）
      if (!wallet) {
        const phantom = wallets.find(w => w.adapter.name === 'Phantom')
        if (phantom) await select(phantom.adapter.name)
      }
      await connect()
      setMenuOpen(false)
    } catch (e) {
      console.error('[WalletConnect] connect error:', e)
    }
  }

  async function handleDisconnect() {
    try {
      await disconnect()
      setMenuOpen(false)
    } catch (e) {
      console.error('[WalletConnect] disconnect error:', e)
    }
  }

  function copyAddress() {
    if (!publicKey) return
    navigator.clipboard?.writeText(publicKey.toBase58()).catch(() => {})
  }

  // 非接続時のボタン
  if (!connected) {
    return (
      <div className={styles.wrap}>
        <button
          type="button"
          className={`${styles.btn} ${styles.primary}`}
          onClick={handleConnect}
          aria-busy={connecting}
          aria-label="Connect Solana wallet"
        >
          {connecting ? 'Connecting…' : 'Connect Wallet'}
        </button>
        <span className={styles.net}>{network}</span>
      </div>
    )
  }

  // 接続中のドロップダウン
  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={`${styles.btn} ${styles.connected}`}
        onClick={() => setMenuOpen(v => !v)}
        aria-expanded={menuOpen}
        aria-controls="wallet-menu"
      >
        <span className={styles.dot} /> {shortAddr(publicKey)}
      </button>
      <span className={styles.net}>{network}</span>

      {menuOpen && (
        <div id="wallet-menu" role="menu" className={styles.menu}>
          <div className={styles.menuHeader}>
            <div className={styles.addr}>{publicKey?.toBase58()}</div>
            {solBalance != null && (
              <div className={styles.balance}>{solBalance.toFixed(4)} SOL</div>
            )}
          </div>
          <button role="menuitem" className={styles.menuItem} onClick={copyAddress}>
            Copy address
          </button>
          <a role="menuitem" className={styles.menuItem} href={explorer} target="_blank" rel="noreferrer">
            View on Solscan
          </a>
          <button role="menuitem" className={`${styles.menuItem} ${styles.danger}`} onClick={handleDisconnect}>
            Disconnect
          </button>
        </div>
      )}
    </div>
  )
}
