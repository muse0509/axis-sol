import React from 'react';
import { FaXTwitter } from 'react-icons/fa6'; // ★★★ Xのアイコンをインポート ★★★
import { FaTelegramPlane } from 'react-icons/fa';
import styles from '../styles/Footer.module.css';

export const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <p className={styles.copyright}>
          © {new Date().getFullYear()} Axis Protocol. All rights reserved.
        </p>
        <div className={styles.socials}>
          <a href="https://x.com/axis__Solana" target="_blank" rel="noopener noreferrer" aria-label="X">
            <FaXTwitter />
          </a>
          <a href="https://t.me/+17f3f2qcJFMxYzE1" target="_blank" rel="noopener noreferrer" aria-label="Telegram">
            <FaTelegramPlane />
          </a>
        </div>
      </div>
    </footer>
  );
};