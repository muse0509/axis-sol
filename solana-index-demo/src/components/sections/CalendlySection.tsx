'use client';
import React from 'react';
import { Mail, Send } from 'lucide-react';

const CalendlySection = () => (
  <div className="py-24 px-6 bg-base-300 text-base-content">
    <div className="w-full max-w-[1100px] mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-[clamp(2.5rem,8vw,3.5rem)] font-bold mb-6">Interested in Learning More?</h2>
        <p className="text-base-content/70 max-w-[800px] mx-auto leading-7 text-[clamp(1rem,4vw,1.1rem)]">
          Schedule a call with the founder to discuss our vision, strategy, and the angel round.
        </p>
      </div>
      
      <div className="card bg-base-200 shadow-xl border border-base-300">
        <div className="card-body p-0">
          <div
            className="h-[700px] rounded-xl overflow-hidden"
            dangerouslySetInnerHTML={{
              __html: `<iframe
                  src="https://calendly.com/yusukekikuta-05/axis-pitch"
                  width="100%"
                  height="100%"
                  frameborder="0"
                ></iframe>`
            }}
          />
        </div>
      </div>
      
      <div className="flex gap-6 justify-center mt-8 flex-wrap">
        <a 
          href="mailto:yusukekikuta.05@gmail.com" 
          className="btn btn-outline gap-2"
        >
          <Mail size={18} /> yusukekikuta.05@gmail.com
        </a>
        <a 
          href="https://t.me/yus0509" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="btn btn-outline gap-2"
        >
          <Send size={18} /> @yus0509 on Telegram
        </a>
      </div>
    </div>
  </div>
);

export default CalendlySection;
