'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Rocket, Zap } from 'lucide-react';

const WhyWinSection = () => {
  const advantages = [
    { 
      icon: CheckCircle, 
      title: 'Proven, Professional Methodology', 
      description: "Our first index mirrors the NASDAQ-100's successful model: a basket of top assets by market cap, equally weighted and rebalanced quarterly. A clear, robust strategy that avoids unproven complexity." 
    },
    { 
      icon: Rocket, 
      title: 'Strategic First-Mover on Solana', 
      description: 'We are giving Solana a core financial primitive it lacks, positioning it as the premier chain for finance. This is a bet on Solana becoming the future of finance, driven by deep, personal passion.' 
    },
    { 
      icon: Zap, 
      title: 'A Deflationary Economic Engine', 
      description: 'Our "Buyback & Burn" mechanism creates a direct link between our fund\'s AUM growth and the value of our governance token ($AXIS), creating a powerful, deflationary flywheel that rewards long-term holders.' 
    }
  ];

  return (
    <div>
      <div className="text-center mb-16">
        <h2 className="text-[clamp(2.5rem,8vw,3.5rem)] font-bold mb-6">Why We Win</h2>
        <p className="text-gray-400 max-w-[800px] mx-auto leading-7 text-[clamp(1rem,4vw,1.1rem)]">
          Our competitive advantage is built on a professional methodology, strategic vision, and sustainable economics.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-[1200px] mx-auto">
        {advantages.map((advantage, index) => (
          <motion.div
            key={index}
            className="card bg-base-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
          >
            <div className="card-body text-center">
              <div className="avatar placeholder mb-4">
                <div className="bg-primary/20 text-primary rounded-full w-16 h-16">
                  <advantage.icon className="w-8 h-8" />
                </div>
              </div>
              <h3 className="card-title text-xl mb-4">{advantage.title}</h3>
              <p className="text-gray-400 leading-relaxed">{advantage.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default WhyWinSection;