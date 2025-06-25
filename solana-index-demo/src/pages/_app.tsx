import React, { FC, useMemo } from 'react';
import type { AppProps } from 'next/app';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import SmoothScroller from '../components/Lenis';



// CSSのインポートを一度にまとめる
import '@solana/wallet-adapter-react-ui/styles.css';
import '../styles/globals.css';

const App: FC<AppProps> = ({ Component, pageProps }) => {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(() => [], [network]);

  return (
    // 1. まず、Solanaネットワークとの接続を確立するプロバイダーを配置
    <ConnectionProvider endpoint={endpoint}>
      {/* 2. 次に、使用するウォレットを管理するプロバイダーを配置 */}
      <WalletProvider wallets={wallets} autoConnect>
        {/* 3. ウォレット接続のモーダル表示を管理するプロバイダーを配置 */}
        <WalletModalProvider>
          {/* 4. スムーズスクロール用のコンポーネントを配置 */}
          <SmoothScroller>
            {/* ★★★ ここが重要 ★★★ */}
            {/* 5. 最後に、ページの本体がすべての機能を使えるように、一番内側に配置 */}
            <Component {...pageProps} />
          </SmoothScroller>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default App;