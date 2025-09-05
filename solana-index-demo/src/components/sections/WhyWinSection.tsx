'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Rocket, Zap } from 'lucide-react';
import { Card } from '../common';

const WhyWinSection = () => {
  const advantages = [
    { 
      icon: CheckCircle, 
      title: 'Proven Methodology', 
      description: "NASDAQ-100 model: top assets by market cap, equally weighted, quarterly rebalancing." 
    },
    { 
      icon: Rocket, 
      title: 'First-Mover Advantage', 
      description: 'Core financial primitive Solana lacks. Betting on Solana becoming the future of finance.' 
    },
    { 
      icon: Zap, 
      title: 'Deflationary Engine', 
      description: 'Buyback & Burn mechanism links AUM growth to $AXIS value, creating a deflationary flywheel.' 
    }
  ];

  return (
    <div>
      <div className="text-center mb-16">
        <h2 className="text-[clamp(2.5rem,8vw,3.5rem)] font-bold mb-6">Why We Win</h2>
        <p className="text-gray-400 max-w-[800px] mx-auto leading-7 text-[clamp(1rem,4vw,1.1rem)]">
          Professional methodology, strategic vision, and sustainable economics.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-[1200px] mx-auto">
        {advantages.map((advantage, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
          >
            <Card className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-blue-500/20 text-blue-500 rounded-full w-16 h-16 flex items-center justify-center">
                  <advantage.icon className="w-8 h-8" />
                </div>
              </div>
              <h3 className="card-title text-xl mb-4">{advantage.title}</h3>
              <p className="text-gray-400 leading-relaxed">{advantage.description}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default WhyWinSection;