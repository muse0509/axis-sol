import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';

const navItems = [
  { name: 'Home', href: '#hero' },
  { name: 'Risks', href: '#risks' },
  { name: 'Product', href: '#product' },
  { name: 'Why Axis', href: '#why' },
  { name: 'Roadmap', href: '#roadmap' },
  { name: 'Team', href: '#team' },
  { name: 'WL', href: '#waitlist' },
];

export const Header = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleLinkClick = () => {
    setIsDrawerOpen(false);
  };

  return (
    <>
      {/* ---------- PC用ヘッダー (ガラス板) ---------- */}
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] flex justify-center pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-8 px-6 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg shadow-black/30 shadow-white/10 relative isolate after:content-[''] after:absolute after:inset-0 after:bg-[url('/noise-8x8.png')] after:opacity-[var(--noise-opacity)] after:pointer-events-none after:animate-[drift_6s_infinite_alternate_ease-in-out] after:bg-repeat">
          <a href="#hero" className="block">
            <Image
              src="/logo.png"  // ★ publicフォルダからのパス。ご自身のファイル名に変更してください。
              alt="Axis Protocol Logo" // ロゴの説明
              width={60} // ★ ロゴの実際の幅に合わせて調整
              height={60} // ★ ロゴの実際の高さに合わせて調整
              priority // ページの最初に読み込む重要な画像であることを示す
            />
          </a>
          <nav className="flex items-center gap-4">
            {navItems.map((item) => (
              <a key={item.name} href={item.href}>
                {/* button自体にはクラス名は不要 (親の.navから指定されているため) */}
                <button className="bg-none border-none px-2.5 py-1.5 text-sm font-bold text-white cursor-pointer transition-colors duration-200 hover:bg-white/20 hover:rounded-lg">{item.name}</button>
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* ---------- ハンバーガーボタン (SP用) ---------- */}
      <button 
        className="fixed right-5 top-5 bg-none border-none z-[110] hidden md:hidden cursor-pointer" 
        onClick={() => setIsDrawerOpen(!isDrawerOpen)}
        aria-label="メニューを開く"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 6H20M4 12H20M4 18H20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* ---------- モバイル用ドロワーメニュー ---------- */}
      <AnimatePresence>
        {isDrawerOpen && (
          <motion.div
            className="fixed top-0 right-0 bottom-0 w-4/5 p-12 pt-12 bg-white/90 backdrop-blur-[calc(var(--blur-strength)+6px)] shadow-[-6px_0_20px_rgba(0,0,0,0.15)] flex flex-col gap-5 z-[105]"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {navItems.map((item) => (
              <a key={item.name} href={item.href} onClick={handleLinkClick}>
                 {/* button自体にはクラス名は不要 (親の.drawerから指定されているため) */}
                <button className="bg-none border-none text-xl text-left text-gray-900 cursor-pointer">{item.name}</button>
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};