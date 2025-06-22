import { FaTwitter, FaTelegramPlane } from 'react-icons/fa';
import styles from '../styles/Footer.module.css';

export const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <p className={styles.copyright}>
          © {new Date().getFullYear()} Axis Protocol. All rights reserved.
        </p>
        <div className={styles.socials}>
          <a href="https://x.com/muse_0509" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
            <FaTwitter />
          </a>
          <a href="https://t.me/yus0509" target="_blank" rel="noopener noreferrer" aria-label="Telegram">
            <FaTelegramPlane />
          </a>
        </div>
      </div>
    </footer>
  );
};