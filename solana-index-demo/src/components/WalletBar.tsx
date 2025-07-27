// src/components/WalletBar.tsx
import React, { useMemo } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton, WalletDisconnectButton } from '@solana/wallet-adapter-react-ui'
import toast from 'react-hot-toast'

const shorten = (k?: string) => (k ? `${k.slice(0, 4)}...${k.slice(-4)}` : '')

export default function WalletBar() {
  const { connection } = useConnection()
  const { connected, publicKey } = useWallet()

  const clusterLabel = useMemo(() => {
    const url = (connection as any)._rpcEndpoint as string
    return url?.includes('devnet') ? 'Devnet' : 'Unknown'
  }, [connection])

  return (
    <div style={{
      position: 'fixed', top: 16, right: 16, display: 'flex', gap: 8,
      alignItems: 'center', zIndex: 50, padding: '8px 10px',
      background: 'rgba(20,20,22,0.6)', borderRadius: 12, backdropFilter: 'blur(8px)'
    }}>
      <span style={{ fontSize: 12, opacity: 0.9 }}>Network: <b>{clusterLabel}</b></span>
      <span style={{ fontSize: 12, opacity: 0.9 }}>
        Status: <b>{connected ? 'Connected' : 'Not connected'}</b>
      </span>
      {connected && <span style={{ fontSize: 12, opacity: 0.9 }}>Wallet: <b>{shorten(publicKey?.toBase58())}</b></span>}
      {/* 接続/切断ボタン（公式 UI） */}
      <WalletMultiButton
        onClick={() => {
          if (clusterLabel !== 'Devnet') {
            toast.error('This dApp only supports Devnet. Please enable Testnet mode in Phantom.')
          }
        }}
      />
      <WalletDisconnectButton />
    </div>
  )
}
