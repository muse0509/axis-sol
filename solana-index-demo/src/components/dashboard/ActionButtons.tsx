'use client';

import { motion } from 'framer-motion';

interface ActionButtonsProps {
  onBuyClick: () => void;
  onBurnClick: () => void;
}

export default function ActionButtons({ onBuyClick, onBurnClick }: ActionButtonsProps) {
  return (
    <motion.div 
      className="flex flex-col md:flex-row gap-4 mb-12 justify-center" 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.8, delay: 0.4 }}
    >
      <button 
        onClick={onBuyClick} 
        className="btn btn-primary btn-lg shadow-lg hover:shadow-xl transition-all duration-200"
      >
        Buy Index Token
      </button>
      
      <button 
        onClick={onBurnClick} 
        className="btn btn-outline btn-lg hover:btn-primary transition-all duration-200"
      >
        Burn Index Token
      </button>
      
      <a 
        href="https://muse-7.gitbook.io/axiswhitepaper/" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="btn btn-outline btn-lg hover:btn-primary transition-all duration-200"
      >
        Read WhitePaper
      </a>
      
      <a 
        href="/challenge" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="btn btn-outline btn-lg hover:btn-primary transition-all duration-200"
      >
        Create Challenge Image
      </a>
    </motion.div>
  );
}
