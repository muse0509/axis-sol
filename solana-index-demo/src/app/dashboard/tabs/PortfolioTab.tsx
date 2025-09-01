'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { ModernCard, GridLayout } from '../../../components/common';

const PortfolioChart = dynamic(() => import('../../../components/portfolio/PortfolioChart'), { ssr: false });
const PortfolioStats = dynamic(() => import('../../../components/portfolio/PortfolioStats'), { ssr: false });
const TokenAllocation = dynamic(() => import('../../../components/portfolio/TokenAllocation'), { ssr: false });

interface TokenData {
  symbol: string;
  name: string;
  allocation: number;
  currentPrice: number;
  mintPrice: number;
  marketCap: number;
  volume24h: number;
  change24h: number;
  changeSinceMint: number;
  icon: string;
}

interface PortfolioData {
  totalValue: number;
  totalChange: number;
  tokens: TokenData[];
  mintDate: string;
}

interface PortfolioTabProps {
  initialLatestEntry: any;
  echartsData: any;
  initialDailyChange: number | null;
  events: any[];
  error?: string;
}

const PortfolioTab = ({}: PortfolioTabProps) => {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPortfolioData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/portfolio');
        if (!response.ok) {
          throw new Error('Failed to fetch portfolio data');
        }
        const data = await response.json();
        setPortfolioData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !portfolioData) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-3">💼</div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">No Portfolio Found</h3>
        <p className="text-gray-600 text-lg mb-6">
          {error || 'Connect your wallet and mint some tokens to see your portfolio'}
        </p>
        <button className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors">
          Mint Tokens
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Portfolio Stats - Compact */}
      <ModernCard className="p-4" gradient>
        <h2 className="text-xl font-bold text-white mb-4 text-center flex items-center justify-center space-x-2">
          <span className="text-2xl">💼</span>
          <span>Portfolio Overview</span>
        </h2>
        <PortfolioStats 
          totalValue={portfolioData.totalValue}
          totalChange={portfolioData.totalChange}
          mintDate={portfolioData.mintDate}
        />
      </ModernCard>

      {/* Charts and Allocation - Compact */}
      <GridLayout cols={2} gap="md">
        <ModernCard className="p-4">
          <h3 className="text-lg font-bold text-white mb-3 flex items-center space-x-2">
            <span className="text-xl">📈</span>
            <span>Performance</span>
          </h3>
          <div className="h-48">
            <PortfolioChart tokens={portfolioData.tokens} />
          </div>
        </ModernCard>
        
        <ModernCard className="p-4">
          <h3 className="text-lg font-bold text-white mb-3 flex items-center space-x-2">
            <span className="text-xl">🥧</span>
            <span>Allocation</span>
          </h3>
          <TokenAllocation tokens={portfolioData.tokens} />
        </ModernCard>
      </GridLayout>

      {/* Token Details - Compact */}
      <ModernCard className="p-4">
        <h3 className="text-xl font-bold text-white mb-4 text-center flex items-center justify-center space-x-2">
          <span className="text-2xl">📋</span>
          <span>Holdings</span>
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left py-2 px-3 text-white/70">Token</th>
                <th className="text-right py-2 px-3 text-white/70">Allocation</th>
                <th className="text-right py-2 px-3 text-white/70">Current Price</th>
                <th className="text-right py-2 px-3 text-white/70">24h Change</th>
                <th className="text-right py-2 px-3 text-white/70">Since Mint</th>
              </tr>
            </thead>
            <tbody>
              {portfolioData.tokens.map((token) => (
                <tr
                  key={token.symbol}
                  className="border-b border-white/10 hover:bg-white/5"
                >
                  <td className="py-2 px-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {token.symbol[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-white text-xs">{token.symbol}</div>
                        <div className="text-white/70 text-xs">{token.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-right py-2 px-3">
                    <div className="flex items-center justify-end space-x-2">
                      <div className="w-8 bg-white/20 rounded-full h-1">
                        <div 
                          className="bg-blue-500 h-1 rounded-full"
                          style={{ width: `${token.allocation}%` }}
                        />
                      </div>
                      <span className="text-white font-medium text-xs">{token.allocation.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="text-right py-2 px-3 text-white text-xs">${token.currentPrice.toFixed(4)}</td>
                  <td className={`text-right py-2 px-3 text-xs ${token.change24h >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                    {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                  </td>
                  <td className={`text-right py-2 px-3 text-xs ${token.changeSinceMint >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                    {token.changeSinceMint >= 0 ? '+' : ''}{token.changeSinceMint.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ModernCard>

      {/* Portfolio Actions - Compact */}
      <GridLayout cols={3} gap="md">
        <ModernCard className="p-3 text-center" gradient>
          <div className="text-2xl mb-2">🔄</div>
          <h4 className="text-sm font-semibold text-white mb-1">Rebalance</h4>
          <button className="w-full py-1.5 bg-white/10 text-white rounded border border-white/20 hover:bg-white/20 transition-colors text-xs">
            Rebalance
          </button>
        </ModernCard>

        <ModernCard className="p-3 text-center" gradient>
          <div className="text-2xl mb-2">💰</div>
          <h4 className="text-sm font-semibold text-white mb-1">Add Funds</h4>
          <button className="w-full py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-xs">
            Add Funds
          </button>
        </ModernCard>

        <ModernCard className="p-3 text-center" gradient>
          <div className="text-2xl mb-2">🔥</div>
          <h4 className="text-sm font-semibold text-white mb-1">Burn</h4>
          <button className="w-full py-1.5 bg-red-500 text-white rounded border border-red-500 hover:bg-red-600 transition-colors text-xs">
            Burn
          </button>
        </ModernCard>
      </GridLayout>
    </div>
  );
};

export default PortfolioTab;
