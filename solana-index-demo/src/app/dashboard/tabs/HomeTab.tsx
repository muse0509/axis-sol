'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { ModernCard, ModernButton, GridLayout } from '../../../components/common';
import { useIndexPrice } from '../../../hooks/useIndexPrice';

const WalletBar = dynamic(() => import('../../../components/crypto/WalletBar'), { ssr: false });

interface HomeTabProps {
  initialLatestEntry: any;
  echartsData: any;
  initialDailyChange: number | null;
  events: any[];
  error?: string;
}

const HomeTab = ({ echartsData }: HomeTabProps) => {
  const { data: indexPriceData, loading: priceLoading } = useIndexPrice();
  const latestClose = indexPriceData?.currentPrice ?? echartsData?.at(-1)?.[2] ?? 100;

  const featureCards = [
    {
      icon: '🪙',
      title: 'Mint Index',
      subtitle: 'Buy AXIS Tokens',
      description: 'Deposit USDC to mint AXIS tokens at current index price',
      action: () => {
        const event = new CustomEvent('dashboard-tab-change', {
          detail: { tabId: 'mint' }
        });
        window.dispatchEvent(event);
      }
    },
    {
      icon: '📊',
      title: 'View Market',
      subtitle: 'Market Data',
      description: 'Explore real-time market data and index performance',
      action: () => {
        const event = new CustomEvent('dashboard-tab-change', {
          detail: { tabId: 'market' }
        });
        window.dispatchEvent(event);
      }
    },
    {
      icon: '💼',
      title: 'Portfolio',
      subtitle: 'Your Holdings',
      description: 'Track your AXIS token holdings and performance',
      action: () => {
        const event = new CustomEvent('dashboard-tab-change', {
          detail: { tabId: 'portfolio' }
        });
        window.dispatchEvent(event);
      }
    }
  ];

  const favorites = [
    {
      name: 'Quick Mint',
      description: 'One-click minting with current index price',
      action: () => {
        const event = new CustomEvent('dashboard-tab-change', {
          detail: { tabId: 'mint' }
        });
        window.dispatchEvent(event);
      }
    },
    {
      name: 'Market Analysis',
      description: 'Detailed market insights and trends',
      action: () => {
        const event = new CustomEvent('dashboard-tab-change', {
          detail: { tabId: 'market' }
        });
        window.dispatchEvent(event);
      }
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2">Home</h1>
        <p className="text-gray-400">Welcome to the AXIS Protocol Dashboard</p>
      </div>

      {/* Connect Wallet Banner */}
      <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-gray-600/30 rounded-xl p-8 text-center">
        <h2 className="text-xl font-semibold text-white mb-4">
          Connect your wallet to view your index positions
        </h2>
        <div className="flex justify-center">
          <WalletBar />
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {featureCards.map((card, index) => (
          <ModernCard 
            key={index}
            className="p-6 cursor-pointer hover:scale-105 transition-transform duration-200"
            dark
            onClick={card.action}
          >
            <div className="text-center">
              <div className="text-4xl mb-4">{card.icon}</div>
              <h3 className="text-xl font-bold text-white mb-2">{card.title}</h3>
              <p className="text-gray-400 text-sm mb-3">{card.subtitle}</p>
              <p className="text-gray-300 text-xs mb-4">{card.description}</p>
              <div className="flex items-center justify-center text-orange-400 text-sm">
                <span>Explore</span>
                <span className="ml-1">→</span>
              </div>
            </div>
          </ModernCard>
        ))}
      </div>

      {/* Your Favorites Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-red-400">❤️</span>
            <h2 className="text-xl font-semibold text-white">Your Favorites</h2>
          </div>
          <button className="text-orange-400 text-sm hover:text-orange-300 transition-colors">
            Discover more →
          </button>
        </div>

        <ModernCard className="p-6" dark>
          {favorites.length > 0 ? (
            <div className="space-y-4">
              {favorites.map((favorite, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg cursor-pointer hover:bg-gray-700/30 transition-colors"
                  onClick={favorite.action}
                >
                  <div>
                    <h3 className="text-white font-medium">{favorite.name}</h3>
                    <p className="text-gray-400 text-sm">{favorite.description}</p>
                  </div>
                  <span className="text-gray-400">→</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">
                No favorite apps yet, <span className="text-orange-400 cursor-pointer hover:text-orange-300">add some!</span>
              </p>
            </div>
          )}
        </ModernCard>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ModernCard className="p-4 text-center" gradient>
          <div className="text-2xl mb-2">💰</div>
                      <div className="text-lg font-bold text-white">${latestClose.toFixed(4)}</div>
            <div className="text-white/70 text-sm">Current Index Price</div>
        </ModernCard>
        <ModernCard className="p-4 text-center" gradient>
          <div className="text-2xl mb-2">🪙</div>
                      <div className="text-lg font-bold text-white">1M</div>
            <div className="text-white/70 text-sm">Total Supply</div>
        </ModernCard>
        <ModernCard className="p-4 text-center" gradient>
          <div className="text-2xl mb-2">📊</div>
                      <div className="text-lg font-bold text-white">$25.5M</div>
            <div className="text-white/70 text-sm">Market Cap</div>
        </ModernCard>
      </div>
    </div>
  );
};

export default HomeTab;
