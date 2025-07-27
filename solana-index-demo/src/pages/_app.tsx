// src/pages/_app.tsx
import type { AppProps } from 'next/app'
import React, { FC, useMemo } from 'react'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { clusterApiUrl } from '@solana/web3.js'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets'
import { Toaster } from 'react-hot-toast'
import SmoothScroller from '../components/Lenis'

// styles
import '@solana/wallet-adapter-react-ui/styles.css'
import '../styles/globals.css'

const App: FC<AppProps> = ({ Component, pageProps }) => {
  // ★ Devnet を固定
  const network = WalletAdapterNetwork.Devnet
  const endpoint = useMemo(() => process.env.NEXT_PUBLIC_RPC_ENDPOINT ?? clusterApiUrl(network), [network])

  // ★ Phantom だけ（必要に応じて他ウォレットも追加）
  const wallets = useMemo(() => [new PhantomWalletAdapter()], [])

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <SmoothScroller>
            <Component {...pageProps} />
            {/* トーストはアプリ内に置く */}
            <Toaster position="top-right" />
          </SmoothScroller>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

export default App
