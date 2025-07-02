import React, { useState } from 'react';
import CountUp from 'react-countup';
import { motion, AnimatePresence } from 'framer-motion';
import { FiExternalLink } from 'react-icons/fi';
import styles from '../styles/BuyModal.module.css';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  indexPrice: number;
};

const MOCK_USDC_BALANCE = 1000.00;
const Spinner = () => <div className={styles.spinner}></div>;

const BuyModal: React.FC<Props> = ({ isOpen, onClose, indexPrice }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [usdcAmount, setUsdcAmount] = useState('');
  const [step, setStep] = useState<'connect' | 'buy' | 'success'>('connect');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isBuying, setIsBuying] = useState(false);

  const handleConnect = () => {
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnected(true);
      setStep('buy');
      setIsConnecting(false);
    }, 1500);
  };

  const handleBuy = () => {
    if (parseFloat(usdcAmount) > MOCK_USDC_BALANCE) {
        alert("Insufficient USDC balance!");
        return;
    }
    setIsBuying(true);
    setTimeout(() => {
      setStep('success');
      setIsBuying(false);
    }, 2000);
  };
  
  const handleClose = () => {
    onClose();
    setTimeout(() => {
        setIsConnected(false);
        setStep('connect');
        setUsdcAmount('');
        setIsConnecting(false);
        setIsBuying(false);
    }, 300);
  }

  const indexAmount = usdcAmount && indexPrice > 0 ? parseFloat(usdcAmount) / indexPrice : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className={styles.modal}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.header}>
              <h3>{step === 'success' ? 'Transaction Successful' : 'Buy Index Token'}</h3>
              <button onClick={handleClose} className={styles.closeButton}>×</button>
            </div>
            
            {step === 'connect' && (
              <div className={styles.content}>
                <p className={styles.prompt}>Please connect your wallet to proceed.</p>
                <button onClick={handleConnect} className={styles.actionButton} disabled={isConnecting}>
                  {isConnecting ? <Spinner /> : 'Connect Wallet'}
                </button>
              </div>
            )}

            {step === 'buy' && (
              <div className={styles.content}>
                <div className={styles.inputWrapper}>
                  <div className={styles.inputHeader}>
                    <span>From</span>
                    <span>Balance: {MOCK_USDC_BALANCE.toFixed(2)}</span>
                  </div>
                  <div className={styles.inputBody}>
                    <input 
                      type="number"
                      value={usdcAmount}
                      onChange={(e) => setUsdcAmount(e.target.value)}
                      placeholder="0.0" 
                      className={styles.input}
                    />
                    <button onClick={() => setUsdcAmount(MOCK_USDC_BALANCE.toString())} className={styles.maxButton}>MAX</button>
                    <span className={styles.tokenLabel}>USDC</span>
                  </div>
                </div>
                
                <div className={styles.swapArrow}>↓</div>

                <div className={styles.inputWrapper}>
                  <div className={styles.inputHeader}>
                    <span>To (Estimated)</span>
                  </div>
                  <div className={styles.inputBody}>
                     <input 
                      type="text"
                      value={indexAmount > 0 ? `~ ${indexAmount.toFixed(5)}` : '0.0'}
                      readOnly
                      className={styles.input}
                    />
                    <span className={styles.tokenLabel}>INDEX</span>
                  </div>
                </div>

                <div className={styles.priceInfo}>
                  1 INDEX ≈ {indexPrice.toFixed(2)} USDC
                </div>
                
                <button 
                    onClick={handleBuy} 
                    className={styles.actionButton}
                    disabled={!usdcAmount || parseFloat(usdcAmount) <= 0 || isBuying}
                >
                  {isBuying ? <Spinner /> : 'Buy Now'}
                </button>
              </div>
            )}
            
            {step === 'success' && (
              <div className={styles.content}>
                 <div className={styles.successIcon}>✓</div>
                 <p className={styles.successAmount}>{indexAmount.toFixed(5)} INDEX</p>
                 <p className={styles.prompt}>Your transaction has been submitted successfully.</p>
                 <a href="#" className={styles.txLink} target="_blank" rel="noopener noreferrer">
                    View on Solscan <FiExternalLink />
                 </a>
                 <button onClick={handleClose} className={styles.actionButton}>
                  Close
                </button>
              </div>
            )}

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BuyModal;