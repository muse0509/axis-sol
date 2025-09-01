'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import SidebarWalletButton from './SidebarWalletButton';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigationItems = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'mint', label: 'Mint', icon: '🪙' },
    { id: 'market', label: 'Market', icon: '📊' },
    { id: 'dashboard', label: 'Index', icon: '📈' },
    { id: 'portfolio', label: 'Portfolio', icon: '💼' },
    { id: 'axis', label: 'AXIS', icon: '⚡' },
    { id: 'challenge', label: 'Challenge', icon: '🎯', external: true },
  ];

  const handleTabClick = (tabId: string, external?: boolean) => {
    if (external) {
      window.location.href = '/challenge';
    } else {
      onTabChange(tabId);
    }
  };

  return (
    <motion.div 
      className={`bg-black/80 backdrop-blur-xl border-r border-gray-700/30 h-screen fixed left-0 top-0 z-40 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-4 border-b border-gray-700/30">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 relative">
              <Image
                src="/logo.png"
                alt="AXIS"
                fill
                className="object-contain"
                sizes="32px"
              />
            </div>
            {!isCollapsed && (
              <motion.span 
                className="text-white font-bold text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                AXIS
              </motion.span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => handleTabClick(item.id, item.external)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                activeTab === item.id
                  ? 'bg-gray-700/50 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-lg">{item.icon}</span>
              {!isCollapsed && (
                <motion.span 
                  className="font-medium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  {item.label}
                </motion.span>
              )}
            </motion.button>
          ))}
        </nav>

        {/* Connect Wallet Button */}
        <div className="p-4 border-t border-gray-700/30">
          <div className="space-y-3">
            <div className="w-full">
              <SidebarWalletButton />
            </div>
            {!isCollapsed && (
              <motion.div 
                className="text-xs text-gray-500 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                https://axis-protocol.com
              </motion.div>
            )}
          </div>
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute top-1/2 -right-3 w-6 h-6 bg-gray-800 border border-gray-600 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors"
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar;
