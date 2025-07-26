import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';

// 1. 作成したCSS Modulesファイルをインポート
import styles from '../styles/Header.module.css';

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
      {/* 2. ▼▼▼ すべての className を {styles.クラス名} の形式に書き換え ▼▼▼ */}

      {/* ---------- PC用ヘッダー (ガラス板) ---------- */}
      <div className={styles.wrapper}>
        <div className={styles.pill}>
        <a href="#hero" className={styles.logoLink}>
            <Image
              src="/logo.png"  // ★ publicフォルダからのパス。ご自身のファイル名に変更してください。
              alt="Axis Protocol Logo" // ロゴの説明
              width={60} // ★ ロゴの実際の幅に合わせて調整
              height=
              {60} // ★ ロゴの実際の高さに合わせて調整
              priority // ページの最初に読み込む重要な画像であることを示す
            />
          </a>
          <nav className={styles.nav}>
            {navItems.map((item) => (
              <a key={item.name} href={item.href}>
                {/* button自体にはクラス名は不要 (親の.navから指定されているため) */}
                <button>{item.name}</button>
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* ---------- ハンバーガーボタン (SP用) ---------- */}
      <button 
        className={styles.hamburger} 
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
            className={styles.drawer}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {navItems.map((item) => (
              <a key={item.name} href={item.href} onClick={handleLinkClick}>
                 {/* button自体にはクラス名は不要 (親の.drawerから指定されているため) */}
                <button>{item.name}</button>
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};