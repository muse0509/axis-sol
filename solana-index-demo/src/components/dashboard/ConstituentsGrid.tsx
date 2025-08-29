'use client';

import { motion, Variants } from 'framer-motion';
import CountUp from 'react-countup';
import { DashboardCard, DashboardGrid } from '../common';

interface RealTimeAsset {
  symbol: string;
  currentPrice: number;
  change24h: number | null;
}

interface ConstituentsGridProps {
  assets: RealTimeAsset[];
  loading: boolean;
}

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeInOut' } },
};

export default function ConstituentsGrid({ assets, loading }: ConstituentsGridProps) {
  return (
    <motion.div 
      className="w-full max-w-[1000px] mb-12" 
      variants={sectionVariants} 
      initial="hidden" 
      whileInView="visible" 
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="mb-6 text-center">
        <h2 className="text-2xl md:text-3xl font-semibold m-0 text-white">Index Constituents</h2>
        <p className="text-gray-400 max-w-[450px] mx-auto mt-2">
          Each asset is equally weighted at 10% to ensure a balanced market representation.
        </p>
        <p className="text-gray-500 text-sm max-w-[450px] mx-auto mt-4 italic">
          Prices are updated every five seconds via Pyth oracle feeds.
        </p>
      </div>

      {loading ? (
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-blue-500"></span>
          <p className="mt-4 text-lg text-gray-300">Loading real-time prices…</p>
        </div>
      ) : (
        <DashboardGrid cols={5} gap="sm">
          {assets.map(asset => (
            <DashboardCard key={asset.symbol} className="p-4 hover:-translate-y-1">
              <div className="flex justify-between items-center mb-2">
                <span className="text-2xl md:text-3xl font-semibold text-white">{asset.symbol}</span>
                <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">10%</div>
              </div>
              <div className="text-2xl md:text-3xl font-medium text-left text-gray-300">
                <CountUp 
                  key={`${asset.symbol}-price`} 
                  end={asset.currentPrice} 
                  decimals={asset.currentPrice < 1 ? 5 : 2} 
                  duration={0.5} 
                  separator="," 
                  prefix="$" 
                />
              </div>
            </DashboardCard>
          ))}
        </DashboardGrid>
      )}
    </motion.div>
  );
}
