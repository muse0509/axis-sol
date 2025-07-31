// components/WalletBar.tsx
'use client'
import dynamic from 'next/dynamic'
import styles from '../styles/WalletBar.module.css'

const WalletConnect = dynamic(() => import('./WalletConnect'), { ssr: false })

export default function WalletBar() {
  return (
    <div className={styles.bar}>
      <div className={styles.brand}></div>
      <WalletConnect />
    </div>
  )
}
