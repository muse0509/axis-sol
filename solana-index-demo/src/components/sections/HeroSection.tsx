'use client';
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const HeroSection = () => (
  <div className="text-center">
    <motion.h1
      className="text-white font-extrabold tracking-tight leading-tight text-[clamp(3rem,10vw,5.5rem)] mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      Axis is building the S&P 500 of Solana
    </motion.h1>
    
    <motion.p
      className="text-gray-300 mb-12 max-w-[600px] mx-auto text-[clamp(1rem,4vw,1.25rem)] leading-relaxed"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.4 }}
    >
      a trusted crypto index that lets investors gain diversified exposure to the digital asset market with a single token.
    </motion.p>
    
    <motion.div
      className="flex gap-6 justify-center flex-wrap"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.6 }}
    >
      <Link 
        href="/dashboard" 
        className="btn btn-primary btn-lg shadow-lg hover:shadow-xl transition-all duration-300"
      >
        View Demo App
      </Link>
      
      <a 
        href="https://acrobat.adobe.com/id/urn:aaid:sc:AP:576b9b2d-51bb-4c45-9dae-82d78bf332e6" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="btn btn-outline btn-lg hover:btn-primary transition-all duration-300"
      >
        View Pitch Deck →
      </a>
    </motion.div>
  </div>
);

export default HeroSection;