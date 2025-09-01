'use client';

import { useState } from 'react';
import { ModernCard, ModernButton, GridLayout } from '../../../components/common';

interface AxisTabProps {
  initialLatestEntry: any;
  echartsData: any;
  initialDailyChange: number | null;
  events: any[];
  error?: string;
}

const AxisTab = ({}: AxisTabProps) => {
  const [activeSection, setActiveSection] = useState<'governance' | 'staking' | 'analytics'>('governance');

  const tokenomics = [
    { label: 'Total Supply', value: '100M', icon: '🪙' },
    { label: 'Circulating', value: '25M', icon: '🔄' },
    { label: 'Market Cap', value: '$12.5M', icon: '💰' },
    { label: 'Treasury', value: '15M', icon: '🏛️' },
  ];

  const stakingStats = [
    { label: 'Total Staked', value: '8.5M AXIS', icon: '🔒' },
    { label: 'APY', value: '12.5%', icon: '📈' },
    { label: 'Your Stake', value: '0 AXIS', icon: '👤' },
  ];

  const renderGovernanceContent = () => (
    <div className="space-y-3">
      <ModernCard className="p-4">
        <h4 className="text-lg font-bold text-white mb-3 flex items-center space-x-2">
          <span className="text-xl">🗳️</span>
          <span>Active Proposals</span>
        </h4>
        
        <div className="space-y-2">
          {[
            {
              title: 'Add MATIC to Index',
              status: 'active',
              votes: { for: 1250000, against: 340000 },
            },
            {
              title: 'Rebalancing Frequency',
              status: 'passed',
              votes: { for: 2100000, against: 180000 },
            },
          ].map((proposal) => (
            <div
              key={proposal.title}
              className="p-3 bg-white/10 rounded border border-white/20"
            >
              <div className="flex justify-between items-start mb-2">
                <h5 className="font-semibold text-white text-sm">{proposal.title}</h5>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  proposal.status === 'active' ? 'bg-green-500/20 text-green-300' :
                  'bg-blue-500/20 text-blue-300'
                }`}>
                  {proposal.status}
                </span>
              </div>
              
              {proposal.status === 'active' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-green-300">For: {proposal.votes.for.toLocaleString()}</span>
                    <span className="text-red-300">Against: {proposal.votes.against.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-1.5">
                    <div 
                      className="bg-green-500 h-1.5 rounded-full"
                      style={{ 
                        width: `${(proposal.votes.for / (proposal.votes.for + proposal.votes.against)) * 100}%` 
                      }}
                    />
                  </div>
                  <div className="flex space-x-2 mt-2">
                    <ModernButton variant="primary" size="sm" className="flex-1 text-xs">Vote For</ModernButton>
                    <ModernButton variant="outline" size="sm" className="flex-1 text-xs">Vote Against</ModernButton>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </ModernCard>
    </div>
  );

  const renderStakingContent = () => (
    <div className="space-y-3">
      <GridLayout cols={3} gap="md">
        {stakingStats.map((stat) => (
          <ModernCard key={stat.label} className="text-center p-3" gradient>
            <div className="text-lg mb-1">{stat.icon}</div>
            <div className="text-lg font-bold text-white mb-1">{stat.value}</div>
            <div className="text-white/70 text-xs">{stat.label}</div>
          </ModernCard>
        ))}
      </GridLayout>

      <ModernCard className="p-4">
        <h4 className="text-lg font-bold text-white mb-3 flex items-center space-x-2">
          <span className="text-xl">🔒</span>
          <span>Stake Your AXIS</span>
        </h4>
        
        <div className="max-w-md mx-auto space-y-3">
          <div>
            <label className="block text-white/70 text-xs mb-1">Amount to Stake</label>
            <input
              type="number"
              placeholder="0.00"
              className="w-full p-2 bg-white/10 rounded border border-white/20 text-white placeholder-white/50 text-sm"
            />
          </div>
          
          <ModernButton variant="primary" size="md" className="w-full" gradient>
            Stake AXIS
          </ModernButton>
        </div>
      </ModernCard>
    </div>
  );

  const renderAnalyticsContent = () => (
    <div className="space-y-3">
      <ModernCard className="p-4">
        <h4 className="text-lg font-bold text-white mb-3 flex items-center space-x-2">
          <span className="text-xl">📊</span>
          <span>Token Analytics</span>
        </h4>
        
        <GridLayout cols={2} gap="md">
          <div className="space-y-2">
            <div className="p-3 bg-white/10 rounded border border-white/20">
              <h5 className="text-xs font-semibold text-white mb-2">Volume Analysis</h5>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-white/70">24h Volume</span>
                  <span className="text-white">$245,000</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/70">7d Average</span>
                  <span className="text-white">$180,000</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="p-3 bg-white/10 rounded border border-white/20">
              <h5 className="text-xs font-semibold text-white mb-2">Holder Distribution</h5>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-white/70">Total Holders</span>
                  <span className="text-white">2,847</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/70">Top 10 Holdings</span>
                  <span className="text-white">15.2%</span>
                </div>
              </div>
            </div>
          </div>
        </GridLayout>
      </ModernCard>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Token Overview */}
      <ModernCard className="p-4 text-center" gradient>
        <div className="text-3xl mb-2">⚡</div>
        <h2 className="text-xl font-bold text-white mb-3">$AXIS Token</h2>
        
        <div className="flex justify-center space-x-4">
          <ModernButton variant="primary" size="sm" gradient>
            Get AXIS
          </ModernButton>
        </div>
      </ModernCard>

      {/* Tokenomics */}
      <ModernCard className="p-4">
        <h3 className="text-lg font-bold text-white mb-3 text-center flex items-center justify-center space-x-2">
          <span className="text-xl">📈</span>
          <span>Tokenomics</span>
        </h3>
        
        <GridLayout cols={4} gap="md">
          {tokenomics.map((item) => (
            <div
              key={item.label}
              className="text-center p-3 bg-white/10 rounded border border-white/20"
            >
              <div className="text-lg mb-1">{item.icon}</div>
              <div className="text-lg font-bold text-white mb-1">{item.value}</div>
              <div className="text-white/70 text-xs">{item.label}</div>
            </div>
          ))}
        </GridLayout>
      </ModernCard>

      {/* Section Tabs */}
      <div className="flex justify-center">
        <div className="flex bg-white/10 rounded-lg p-1 border border-white/20">
          {[
            { key: 'governance', label: 'Governance', icon: '🗳️' },
            { key: 'staking', label: 'Staking', icon: '🔒' },
            { key: 'analytics', label: 'Analytics', icon: '📊' },
          ].map((section) => (
            <button
              key={section.key}
              onClick={() => setActiveSection(section.key as any)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                activeSection === section.key
                  ? 'bg-white/20 text-white border border-white/30'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="text-xs">{section.icon}</span>
              <span>{section.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Section Content */}
      <div>
        {activeSection === 'governance' && renderGovernanceContent()}
        {activeSection === 'staking' && renderStakingContent()}
        {activeSection === 'analytics' && renderAnalyticsContent()}
      </div>
    </div>
  );
};

export default AxisTab;