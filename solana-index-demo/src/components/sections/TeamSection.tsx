'use client';
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

const TeamSection = () => {
  const teamMembers = [
    { 
      name: "Yusuke Kikuta", 
      role: "Founder", 
      bio: "A founder with a rare combination of obsessive focus, proven technical execution, and extreme learning agility. A self-taught engineer who transitioned from a 13-year career in music to independently building a successful freelance blockchain development career. This obsessive focus and resilience are our ultimate competitive advantages.", 
      image: "/muse.jpg", 
      link: "https://x.com/muse_0509", 
      isSuperTeam: true 
    },
  ];

  return (
    <div>
      <div className="text-center mb-16">
        <h2 className="text-[clamp(2.5rem,8vw,3.5rem)] font-bold mb-6">Why Me? A Founder-Led Bet</h2>
        <p className="text-gray-400 max-w-[800px] mx-auto leading-7 text-[clamp(1rem,4vw,1.1rem)]">
          Early-stage investing is a bet on the founder. I will out-learn, out-build, and out-execute any competitor.
        </p>
      </div>
      
      <div className="flex justify-center gap-12 flex-wrap">
        {teamMembers.map((member, index) => (
          <motion.div
            key={member.name}
            className="card bg-base-200 shadow-xl border border-base-300 w-80"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
          >
            <div className="card-body text-center">
              <div className="avatar mb-6">
                <div className="w-32 h-32 rounded-full relative">
                  <Image 
                    src={member.image} 
                    alt={member.name} 
                    width={128} 
                    height={128} 
                    className="rounded-full object-cover" 
                  />
                  {member.isSuperTeam && (
                    <div className="absolute -bottom-2 -right-2">
                      <Image 
                        src="/superteam.png" 
                        alt="SuperTeam Badge" 
                        width={48} 
                        height={48} 
                        className="rounded-full bg-base-300 p-1" 
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <h3 className="card-title text-xl mb-1">{member.name}</h3>
              <p className="text-secondary mb-4">{member.role}</p>
              <p className="text-gray-400 leading-relaxed text-sm">{member.bio}</p>
              
              <div className="card-actions justify-center mt-6">
                <a 
                  className="btn btn-primary btn-sm" 
                  href={member.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  X account
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TeamSection;
