import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertTriangle } from 'lucide-react';
import styles from '../styles/Modal.module.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'success' | 'error';
  title: string;
  message: string;
}

export const Modal = ({ isOpen, onClose, type, title, message }: ModalProps) => {
  // 状態に応じてアイコンと色を決定
  const Icon = type === 'success' ? CheckCircle : AlertTriangle;
  const iconColor = type === 'success' ? styles.iconSuccess : styles.iconError;

  return (
    <AnimatePresence>
      {isOpen && (
        // オーバーレイ（背景の黒い部分）
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          {/* モーダル本体 */}
          <motion.div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()} // モーダル内クリックで閉じないように
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <button className={styles.closeButton} onClick={onClose}><X /></button>
            <div className={styles.iconContainer}>
                <Icon className={`${styles.icon} ${iconColor}`} size={48} />
            </div>
            <h3 className={styles.title}>{title}</h3>
            <p className={styles.message}>{message}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};