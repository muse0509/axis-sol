'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Users } from 'lucide-react';

const TractionSection = () => (
  <div>
    <div className="text-center mb-16">
      <h2 className="text-[clamp(2.5rem,8vw,3.5rem)] font-bold mb-6">Proven Vision & Traction</h2>
      <p className="text-gray-400 max-w-[800px] mx-auto leading-7 text-[clamp(1rem,4vw,1.1rem)]">
        We're not just starting a project; we're building a movement with key ecosystem support.
      </p>
    </div>
    
    <div className="grid md:grid-cols-2 gap-12 items-center">
      <motion.div 
        className="card bg-base-200 shadow-xl border border-base-300" 
        initial={{ opacity: 0, x: -30 }} 
        whileInView={{ opacity: 1, x: 0 }} 
        viewport={{ once: true, amount: 0.5 }} 
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        <div className="card-body">
          <div className="avatar placeholder mb-6">
            <div className="bg-secondary/20 text-secondary rounded-full w-12 h-12">
              <Zap className="w-6 h-6" />
            </div>
          </div>
          <h3 className="card-title text-xl mb-4">Ecosystem-Validated Vision</h3>
          <p className="text-gray-300">
            Our vision isn't just theory. From its earliest stages, Axis has attracted the attention and support of core teams within the Solana ecosystem, including Backpack, Webacy, and MagicBlock, ensuring our foundation is robust and aligned with the market.
          </p>
        </div>
      </motion.div>
      
      <motion.div 
        className="card bg-base-200 shadow-xl border border-base-300" 
        initial={{ opacity: 0, x: 30 }} 
        whileInView={{ opacity: 1, x: 0 }} 
        viewport={{ once: true, amount: 0.5 }} 
        transition={{ duration: 0.7, delay: 0.4 }}
      >
        <div className="card-body">
          <div className="avatar placeholder mb-6">
            <div className="bg-secondary/20 text-secondary rounded-full w-12 h-12">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <h3 className="card-title text-xl mb-4">A Growing Community</h3>
          <p className="text-gray-300">
            Our mission has already attracted a strong and growing community of over 100 early supporters who believe in a more stable and transparent future for on-chain investing.
          </p>
        </div>
      </motion.div>
    </div>
  </div>
);

export default TractionSection;
