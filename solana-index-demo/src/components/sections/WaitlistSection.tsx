'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Key, Gift, Lock, Wallet, Send } from 'lucide-react';

interface WaitlistSectionProps {
  setModalState: (state: { isOpen: boolean; type: 'success' | 'error'; title: string; message: string }) => void;
}

const WaitlistSection = ({ setModalState }: WaitlistSectionProps) => {
  const { connected, publicKey, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const [isJoined, setIsJoined] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleJoin = async () => {
    if (!publicKey) return;
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/join-waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: publicKey.toBase58() }),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setIsJoined(true);
        setModalState({ 
          isOpen: true, 
          type: 'success', 
          title: 'Welcome!', 
          message: 'You will be notified of early access and future rewards. Thank you for your support!' 
        });
      } else {
        setModalState({ 
          isOpen: true, 
          type: 'error', 
          title: 'Oops!', 
          message: result.message || 'An error occurred. Please try again.' 
        });
      }
    } catch (err) {
      console.error("Failed to join waitlist:", err);
      setModalState({ 
        isOpen: true, 
        type: 'error', 
        title: 'Error', 
        message: 'An unexpected error occurred.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConnectClick = () => {
    setVisible(true);
  };

  const shortenAddress = (address: string) => `${address.slice(0, 4)}...${address.slice(-4)}`;

  return (
    <div>
      <div className="text-center mb-16">
        <h2 className="text-[clamp(2.5rem,8vw,3.5rem)] font-bold mb-6">The Market Can Finally Grow Up.</h2>
        <p className="text-gray-400 max-w-[800px] mx-auto leading-7 text-[clamp(1rem,4vw,1.1rem)]">
          Because the guide has arrived. Join us to be part of the journey.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-12 items-center mt-12">
        <div className="text-left space-y-6">
          <h4 className="text-xl font-semibold">By joining, you become eligible for:</h4>
          <ul className="space-y-4">
            <li className="flex items-center gap-4 text-lg">
              <div className="avatar placeholder">
                <div className="bg-secondary/20 text-secondary rounded-full w-8 h-8">
                  <Key size={16} />
                </div>
              </div>
              <span>Early access to our beta platform.</span>
            </li>
            <li className="flex items-center gap-4 text-lg">
              <div className="avatar placeholder">
                <div className="bg-secondary/20 text-secondary rounded-full w-8 h-8">
                  <Gift size={16} />
                </div>
              </div>
              <span>Future airdrops and community rewards.</span>
            </li>
            <li className="flex items-center gap-4 text-lg">
              <div className="avatar placeholder">
                <div className="bg-secondary/20 text-secondary rounded-full w-8 h-8">
                  <Lock size={16} />
                </div>
              </div>
              <span>A secured spot for upcoming product launches.</span>
            </li>
          </ul>
          <p className="text-sm text-gray-500 italic">
            We respect your privacy. We only store your wallet address and nothing else.
          </p>
        </div>

        <div className="card bg-base-200 shadow-xl border border-base-300 max-w-lg mx-auto">
          <div className="card-body text-center space-y-6">
            {!connected ? (
              <>
                <p className="text-lg">Connect your wallet to get started.</p>
                <button 
                  onClick={handleConnectClick} 
                  className="btn btn-primary btn-lg gap-2"
                >
                  <Wallet size={20} /> Connect Wallet
                </button>
              </>
            ) : (
              <>
                <div className="alert alert-info">
                  <span>Connected as: {shortenAddress(publicKey!.toBase58())}</span>
                  <button 
                    onClick={() => disconnect()} 
                    className="btn btn-ghost btn-sm"
                  >
                    Disconnect
                  </button>
                </div>

                {!isJoined ? (
                  <button 
                    onClick={handleJoin} 
                    className="btn btn-primary btn-lg gap-2" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : (
                      <>
                        <Send size={18} /> Join the Community
                      </>
                    )}
                  </button>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="alert alert-success"
                  >
                    <span>✅ Welcome! You're on the list.</span>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitlistSection;
