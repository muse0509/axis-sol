'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Flag, Target, Rocket, Compass } from 'lucide-react';

const RoadmapSection = () => {
  const roadmapItems = [
    { 
      icon: Flag, 
      phase: "2025 Q4: Foundation", 
      title: "Protocol Built & Secured", 
      description: "Complete smart contract development, pass multiple top-tier security audits, and finalize the global-first legal structure in Dubai." 
    },
    { 
      icon: Target, 
      phase: "2026 Q1: Launch", 
      title: "Mainnet Launch & Initial Adoption", 
      description: "Launch the $AXIS-INDEX on mainnet and drive early AUM growth through the strategic 'Genesis Investor' airdrop campaign." 
    },
    { 
      icon: Rocket, 
      phase: "2026 Q2: Growth", 
      title: "Scale & Integrate", 
      description: "Achieve the milestone of $1M AUM and secure key partnerships with leading wallets and DeFi protocols to expand our reach." 
    },
    { 
      icon: Compass, 
      phase: "2026 Q3: Decentralization", 
      title: "Empower the Community", 
      description: "Launch $AXIS staking and governance features to decentralize control. Begin research and development for the next wave of products." 
    },
  ];

  return (
    <div>
      <div className="text-center mb-16">
        <h2 className="text-[clamp(2.5rem,8vw,3.5rem)] font-bold mb-6">Our Roadmap</h2>
        <p className="text-gray-400 max-w-[800px] mx-auto leading-7 text-[clamp(1rem,4vw,1.1rem)]">
          A clear, step-by-step plan to build the asset management layer for the digital economy.
        </p>
      </div>
      
      <div className="relative max-w-[900px] mx-auto my-4">
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-gradient-to-b from-transparent via-primary/50 to-transparent -translate-x-1/2" />
        
        {roadmapItems.map((item, index) => (
          <div key={index} className={`relative w-1/2 px-4 box-border ${index % 2 === 0 ? 'text-right pr-12' : 'left-1/2 pl-12 text-left'} mb-16`}> 
            <motion.div
              className={`absolute top-0 -translate-y-1/2 w-12 h-12 rounded-full bg-base-300 border-2 border-primary flex items-center justify-center ${index % 2 === 0 ? 'right-[-24px]' : 'left-[-24px]'}`}
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <item.icon className="w-6 h-6 text-primary" />
            </motion.div>
            
            <motion.div
              className="card bg-base-200 shadow-xl border border-base-300"
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="card-body">
                <p className="font-bold text-primary mb-2">{item.phase}</p>
                <h3 className="card-title text-xl mb-2">{item.title}</h3>
                <p className="text-gray-400">{item.description}</p>
              </div>
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoadmapSection;
