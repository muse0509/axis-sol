'use client';

import { motion, Variants } from 'framer-motion';
import dynamic from 'next/dynamic';
import type { EChartProps } from '../charts/EChartsChart';

interface MarketEvent {
  event_date: string;
  title: string;
  description: string;
}

interface ChartSectionProps {
  echartsData: (string | number)[][] | null;
  events: MarketEvent[];
}

const EChartsChart = dynamic<EChartProps>(
  () => import('../charts/EChartsChart'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[500px]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="ml-4">Loading chart…</p>
      </div>
    ),
  }
);

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeInOut' } },
};

export default function ChartSection({ echartsData, events }: ChartSectionProps) {
  return (
    <motion.div 
      className="w-full max-w-[1000px] card bg-base-200 border border-base-300 shadow-xl backdrop-blur-md mb-12" 
      variants={sectionVariants} 
      initial="hidden" 
      whileInView="visible" 
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="card-body p-4 md:p-8">
        {echartsData && <EChartsChart data={echartsData} events={events} disableAnimation />}
      </div>
    </motion.div>
  );
}
