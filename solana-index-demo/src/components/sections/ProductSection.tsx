'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, CheckCircle, Shield } from 'lucide-react';
import { Card } from '../common';

const ProductSection = () => {
  return (
    <div>
      <div className="text-center mb-16">
        <h2 className="text-[clamp(2.5rem,8vw,3.5rem)] font-bold mb-6">What We Build</h2>
        <p className="text-gray-400 max-w-[800px] mx-auto leading-7 text-[clamp(1rem,4vw,1.1rem)]">
          Professional-grade index funds for the Solana ecosystem. Turn chaos into structured investment.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mt-12">
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <h3 className="text-2xl font-bold">Asset Management Layer for Digital Economy</h3>
          <p className="text-gray-300 leading-relaxed">
            Building the rails for sophisticated passive investment products - the on-chain equivalent of the S&P 500.
          </p>
        </motion.div>
        
        <motion.div
          className=""
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <Card className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                <TrendingUp size={20} className="text-blue-500" />
              </div>
              <div>
                <strong className="text-white">Growth Opportunity:</strong>
                <span className="text-gray-300"> Solana ecosystem lacks professional investment tools.</span>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                <CheckCircle size={20} className="text-blue-500" />
              </div>
              <div>
                <strong className="text-white">TradFi & DeFi Bridge:</strong>
                <span className="text-gray-300"> Bringing proven index fund models on-chain.</span>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                <Shield size={20} className="text-blue-500" />
              </div>
              <div>
                <strong className="text-white">Sustainable Model:</strong>
                <span className="text-gray-300"> Revenue tied to Assets Under Management.</span>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductSection;
