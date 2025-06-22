import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence,  Variants } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import styles from '../styles/Header.module.css';


interface HeaderProps {
  setCurrentSection: (index: number) => void;
}

const menuItems = [
  { name: "Home", index: 0 },
  { name: "Risks", index: 1 },
  { name: "Product", index: 2 },
  { name: "Why Axis", index: 3 },
  { name: "Roadmap", index: 4 },
  { name: "Team", index: 5 },
];

export const Header = ({ setCurrentSection }: HeaderProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavClick = (index: number) => {
    setCurrentSection(index);
    setIsOpen(false);
  };

  const menuVariants: Variants = {
    open: {
      x: 0,
      transition: {
        staggerChildren: 0.07,
        delayChildren: 0.2,
        ease: 'easeOut',          // ← 型 union に含まれる値へ変更
        duration: 0.5,
        type: 'tween',            // 明示すると可読性↑
      },
    },
    closed: {
      x: '100%',                  // 旧版なら 320 など number に統一
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1,
        when: 'afterChildren',
        ease: 'easeIn',
        duration: 0.4,
        type: 'tween',
      },
    },
  };

  const itemVariants = {
    open: {
      y: 0,
      opacity: 1,
      transition: {
        y: { stiffness: 1000, velocity: -100 },
      },
    },
    closed: {
      y: 50,
      opacity: 0,
      transition: {
        y: { stiffness: 1000 },
      },
    },
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.headerLogo}>
          <Image src="/logo.png" alt="Axis Protocol Logo" width={140} height={50} priority />
        </div>

        <nav className={styles.desktopNav}>
          {menuItems.map((item) => (
            <button key={item.name} onClick={() => handleNavClick(item.index)}>
              {item.name}
            </button>
          ))}
        </nav>

        <button
          className={styles.hamburgerButton}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          <AnimatePresence initial={false} mode="wait">
            <motion.span
              key={isOpen ? 'x' : 'menu'}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.mobileNavWrapper}
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            <button
              className={styles.mobileNavCloseButton}
              onClick={() => setIsOpen(false)}
              aria-label="Close menu"
            >
                <X size={32} />
            </button>

            <motion.nav className={styles.mobileNav}>
              {menuItems.map((item) => (
                <motion.button
                  key={item.name}
                  onClick={() => handleNavClick(item.index)}
                  variants={itemVariants}
                >
                  {item.name}
                </motion.button>
              ))}
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};