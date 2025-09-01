'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import toast from 'react-hot-toast';

const SidebarWalletButton = () => {
  const { connected, publicKey, connect, disconnect, wallet, wallets, select } = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);
  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 點擊外部關閉菜單
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowWalletMenu(false);
      }
    };

    if (showWalletMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showWalletMenu]);

  const handleConnect = async (selectedWalletName?: string) => {
    if (connected) {
      try {
        await disconnect();
        toast.success('Wallet disconnected');
      } catch (error) {
        console.error('Failed to disconnect wallet:', error);
        toast.error('Failed to disconnect wallet');
      }
    } else {
      setIsConnecting(true);
      setShowWalletMenu(false);
      try {
        // 確保有錢包被選擇
        if (!wallet || selectedWalletName) {
          const walletToSelect = selectedWalletName 
            ? wallets.find(w => w.adapter.name === selectedWalletName)
            : wallet || wallets.find(w => w.adapter.name === 'Phantom') || wallets[0];
          
          if (walletToSelect) {
            await select(walletToSelect.adapter.name);
          } else {
            throw new Error('No wallet available. Please install a Solana wallet.');
          }
        }
        await connect();
        toast.success('Wallet connected successfully');
      } catch (error) {
        console.error('Failed to connect wallet:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet';
        toast.error(errorMessage);
      } finally {
        setIsConnecting(false);
      }
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  // 檢查是否有可用的錢包
  const hasWallets = wallets.length > 0;

  return (
    <div className="relative" ref={menuRef}>
      <motion.button
        onClick={() => connected ? handleConnect() : setShowWalletMenu(!showWalletMenu)}
        disabled={isConnecting || !hasWallets}
        className={`w-full font-medium py-2.5 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
          connected 
            ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white' 
            : hasWallets
            ? 'bg-gradient-to-r from-orange-500 to-blue-500 hover:from-orange-600 hover:to-blue-600 text-white'
            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
        }`}
        whileHover={!isConnecting && hasWallets ? { scale: 1.02 } : {}}
        whileTap={!isConnecting && hasWallets ? { scale: 0.98 } : {}}
      >
        {isConnecting ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Connecting...</span>
          </div>
        ) : connected && publicKey ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-sm">{formatAddress(publicKey.toBase58())}</span>
          </div>
        ) : !hasWallets ? (
          <div className="flex items-center justify-center space-x-2">
            <span className="text-sm">No Wallet Found</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <span className="text-sm">Connect Wallet</span>
            <span className="text-xs">▼</span>
          </div>
        )}
      </motion.button>

      {/* Wallet Selection Menu */}
      {showWalletMenu && !connected && hasWallets && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute bottom-full left-0 right-0 mb-2 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50"
        >
          <div className="p-2 space-y-1">
            {wallets.map((walletOption) => (
              <button
                key={walletOption.adapter.name}
                onClick={() => handleConnect(walletOption.adapter.name)}
                className="w-full text-left px-3 py-2 text-sm text-white hover:bg-gray-700 rounded transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{walletOption.adapter.icon}</span>
                  <span>{walletOption.adapter.name}</span>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SidebarWalletButton;
