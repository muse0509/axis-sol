'use client';

import { motion, Variants } from 'framer-motion';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import CountUp from 'react-countup';

interface IndexValueCardProps {
  indexValue: number;
  dailyChange: number | null;
}

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeInOut' } },
};

export default function IndexValueCard({ indexValue, dailyChange }: IndexValueCardProps) {
  return (
    <motion.div 
      className="card bg-base-200 border border-base-300 shadow-xl backdrop-blur-md mb-12 w-full max-w-[500px] mx-auto" 
      variants={sectionVariants} 
      initial="hidden" 
      whileInView="visible" 
      viewport={{ once: true, amount: 0.8 }}
    >
      <div className="card-body text-center">
        <h3 className="card-title justify-center text-lg md:text-xl text-base-content/70 font-medium mb-4">
          Current Index Value (Base: 100)
        </h3>
        
        <div className="flex flex-col md:flex-row items-baseline justify-center gap-4 md:gap-6">
          <div className="text-4xl md:text-6xl font-bold leading-none bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            <CountUp end={indexValue} decimals={2} duration={0.2} separator="," />
          </div>
          
          {dailyChange !== null && (
            <div className={`text-2xl md:text-3xl font-semibold flex items-center gap-2 ${
              dailyChange >= 0 ? 'text-success' : 'text-error'
            }`}>
              {dailyChange >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
              <CountUp 
                key="daily-change" 
                end={dailyChange} 
                decimals={2} 
                duration={0.5} 
                suffix="%" 
              />
              <span className="text-sm text-base-content/60 font-normal ml-1">(24H)</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
