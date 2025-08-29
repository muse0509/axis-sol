'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, CheckCircle, Shield } from 'lucide-react';

const ProductSection = () => {
  return (
    <div>
      <div className="text-center mb-16">
        <h2 className="text-[clamp(2.5rem,8vw,3.5rem)] font-bold mb-6">What We're Building</h2>
        <p className="text-gray-400 max-w-[800px] mx-auto leading-7 text-[clamp(1rem,4vw,1.1rem)]">
          Axis is building the foundational asset management layer for the Solana ecosystem. Our first product, $AXIS-INDEX, is a trusted, on-chain index fund that allows anyone to invest in Solana's growth with a single click. We turn casino-level chaos into a professional-grade financial product.
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
          <h3 className="text-2xl font-bold">Our Vision: The Asset Management Layer for the Digital Economy</h3>
          <p className="text-gray-300 leading-relaxed">
            Axis is more than a single fund. We are building the rails for a suite of sophisticated, passive investment products, becoming the on-chain equivalent of the S&P 500 for a new generation of investors.
          </p>
        </motion.div>
        
        <motion.div
          className=""
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <div className="card bg-base-200 shadow-xl border border-base-300">
            <div className="card-body space-y-6">
              <div className="flex items-start gap-4">
                <TrendingUp size={20} className="text-primary mt-1 flex-shrink-0" />
                <div>
                  <strong className="text-white">Explosive Growth Opportunity:</strong>
                  <span className="text-gray-300"> Solana is a multi-billion dollar ecosystem lacking professional-grade, passive investment tools.</span>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <CheckCircle size={20} className="text-primary mt-1 flex-shrink-0" />
                <div>
                  <strong className="text-white">Bridging TradFi & DeFi:</strong>
                  <span className="text-gray-300"> The global asset management market is worth over $100 trillion. We are bringing its most successful model (index funds) on-chain.</span>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <Shield size={20} className="text-primary mt-1 flex-shrink-0" />
                <div>
                  <strong className="text-white">Clear, Sustainable Business Model:</strong>
                  <span className="text-gray-300"> Revenue is tied directly to Assets Under Management (AUM), a model proven for decades in TradFi.</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductSection;
