'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { ModernCard, GridLayout, ModernButton } from '../../../components/common';

const IndexValueCard = dynamic(() => import('../../../components/dashboard/IndexValueCard'), { ssr: false });
const ConstituentsGrid = dynamic(() => import('../../../components/dashboard/ConstituentsGrid'), { ssr: false });
const ChartSection = dynamic(() => import('../../../components/dashboard/ChartSection'), { ssr: false });
const EventTimeline = dynamic(() => import('../../../components/dashboard/EventTimeline'), { ssr: false });

interface DashboardTabProps {
  initialLatestEntry: any;
  echartsData: any;
  initialDailyChange: number | null;
  events: any[];
  error?: string;
}

const DashboardTab = ({ 
  initialLatestEntry, 
  echartsData, 
  initialDailyChange, 
  events 
}: DashboardTabProps) => {
  const [activeSection, setActiveSection] = useState<'index' | 'axis'>('index');

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

  const renderAxisContent = () => (
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

      {/* Staking Stats */}
      <ModernCard className="p-4">
        <h3 className="text-lg font-bold text-white mb-3 text-center flex items-center justify-center space-x-2">
          <span className="text-xl">🔒</span>
          <span>Staking</span>
        </h3>
        
        <GridLayout cols={3} gap="md">
          {stakingStats.map((stat) => (
            <ModernCard key={stat.label} className="text-center p-3" gradient>
              <div className="text-lg mb-1">{stat.icon}</div>
              <div className="text-lg font-bold text-white mb-1">{stat.value}</div>
              <div className="text-white/70 text-xs">{stat.label}</div>
            </ModernCard>
          ))}
        </GridLayout>
      </ModernCard>

      {/* Governance */}
      <ModernCard className="p-4">
        <h3 className="text-lg font-bold text-white mb-3 text-center flex items-center justify-center space-x-2">
          <span className="text-xl">🗳️</span>
          <span>Governance</span>
        </h3>
        
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



  if (!initialLatestEntry || !echartsData?.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400 text-lg">No data available</p>
      </div>
    );
  }

  const latestClose = echartsData.at(-1)![2] as number;
  const baseOpen = echartsData[0][1] as number;
  const fallbackIdx = baseOpen ? (latestClose / baseOpen) * 100 : 0;
  const displayedIdx = fallbackIdx;

  return (
    <div className="space-y-4">
      {/* Section Tabs */}
      <div className="flex justify-center">
        <div className="flex bg-white/10 rounded-lg p-1 border border-white/20">
          {[
            { key: 'index', label: 'Index', icon: '📈' },
            { key: 'axis', label: 'AXIS', icon: '⚡' },
          ].map((section) => (
            <button
              key={section.key}
              onClick={() => setActiveSection(section.key as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded text-sm font-medium transition-colors ${
                activeSection === section.key
                  ? 'bg-white/20 text-white border border-white/30'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="text-sm">{section.icon}</span>
              <span>{section.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Section Content */}
      {activeSection === 'index' ? (
        <>
      {/* Index Value Card */}
      <div className="flex justify-center">
        <IndexValueCard 
          indexValue={displayedIdx}
          dailyChange={initialDailyChange}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Constituents Grid */}
        <ModernCard className="p-3 sm:p-4" gradient>
              <ConstituentsGrid />
        </ModernCard>

        {/* Chart Section */}
        <ModernCard className="p-3 sm:p-4" dark>
          <ChartSection 
            echartsData={echartsData}
            events={events}
          />
        </ModernCard>
      </div>

      {/* Event Timeline - Compact */}
      <ModernCard className="p-3 sm:p-4" dark>
        <EventTimeline events={events} />
      </ModernCard>
        </>
      ) : (
        renderAxisContent()
      )}
    </div>
  );
};

export default DashboardTab;
