import React from 'react';
import Image from 'next/image';
import styles from '../styles/Landing.module.css';

interface HeaderProps {
  setCurrentSection: (index: number) => void;
}

export const Header = ({ setCurrentSection }: HeaderProps) => {
  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.headerLogo}>
          <Image src="/logo.png" alt="Axis Protocol Logo" width={120} height={40} priority />
        </div>
        <nav className={styles.headerNav}>
          {/* インデックスを新しいセクションに合わせて調整 */}
          <button onClick={() => setCurrentSection(0)}>Home</button>
          <button onClick={() => setCurrentSection(1)}>Risks</button>
          <button onClick={() => setCurrentSection(2)}>Product</button>
          <button onClick={() => setCurrentSection(3)}>Why Axis</button>
          <button onClick={() => setCurrentSection(4)}>Roadmap</button>
          <button onClick={() => setCurrentSection(5)}>Team</button>
        </nav>
      </div>
    </header>
  );
};