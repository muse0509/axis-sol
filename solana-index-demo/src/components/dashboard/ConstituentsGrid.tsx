'use client';

import { motion, Variants } from 'framer-motion';
import CountUp from 'react-countup';

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
        <h2 className="text-2xl md:text-3xl font-semibold m-0">Index Constituents</h2>
        <p className="text-base-content/70 max-w-[450px] mx-auto mt-2">
          Each asset is equally weighted at 10% to ensure a balanced market representation.
        </p>
        <p className="text-base-content/50 text-sm max-w-[450px] mx-auto mt-4 italic">
          Prices are updated every five seconds via Pyth oracle feeds.
        </p>
      </div>

      {loading ? (
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-lg">Loading real-time prices…</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {assets.map(asset => (
            <div key={asset.symbol} className="card bg-base-200 border border-base-300 hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
              <div className="card-body p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-2xl md:text-3xl font-semibold">{asset.symbol}</span>
                  <div className="badge badge-primary badge-sm">10%</div>
                </div>
                <div className="text-2xl md:text-3xl font-medium text-left">
                  <CountUp 
                    key={`${asset.symbol}-price`} 
                    end={asset.currentPrice} 
                    decimals={asset.currentPrice < 1 ? 5 : 2} 
                    duration={0.5} 
                    separator="," 
                    prefix="$" 
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
