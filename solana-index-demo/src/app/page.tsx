'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Clock, Shield, Rocket, Flag, Target, Zap, Compass, Send, Wallet, CheckCircle, Key, Lock, Gift, Users, Mail, TrendingUp } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import styles from '../styles/Landing.module.css';
import { Header } from '../components/Header';
import { Background } from '../components/Background';
import { Modal } from '../components/Modal';
import { Footer } from '../components/Footer';
import calendlyStyles from '../styles/Calendly.module.css';

// --- セクション別コンポーネント ---

const Section = ({ children, id }: { children: React.ReactNode, id: string }) => (
  <section id={id} className={styles.section}>
      <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
      >
          {children}
      </motion.div>
  </section>
);

const HeroSection = () => (
    <div className={styles.heroContent}>
      <motion.h1
        className={styles.heroTitleLarge}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        Axis is building the S&P 500 of Solana
      </motion.h1>
      <motion.p
        className={styles.heroSubtitleLarge}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        a trusted crypto index that lets investors gain diversified exposure to the digital asset market with a single token.
      </motion.p>
      <motion.div
        className={styles.heroCtaGroup}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <Link href="/dashboard" className={styles.ctaButtonPrimary}>
          View Demo App
        </Link>
        <a href="https://acrobat.adobe.com/id/urn:aaid:sc:AP:576b9b2d-51bb-4c45-9dae-82d78bf332e6" target="_blank" rel="noopener noreferrer" className={styles.ctaButtonSecondary}>
          View Pitch Deck →
        </a>
      </motion.div>
    </div>
  );

const WhyWinSection = () => {
    const advantages = [
        { icon: CheckCircle, title: 'Proven, Professional Methodology', description: "Our first index mirrors the NASDAQ-100's successful model: a basket of top assets by market cap, equally weighted and rebalanced quarterly. A clear, robust strategy that avoids unproven complexity." },
        { icon: Rocket, title: 'Strategic First-Mover on Solana', description: 'We are giving Solana a core financial primitive it lacks, positioning it as the premier chain for finance. This is a bet on Solana becoming the future of finance, driven by deep, personal passion.' },
        { icon: Zap, title: 'A Deflationary Economic Engine', description: 'Our "Buyback & Burn" mechanism creates a direct link between our fund\'s AUM growth and the value of our governance token ($AXIS), creating a powerful, deflationary flywheel that rewards long-term holders.' }
    ];
    return(
    <div className={styles.sectionContent}>
        <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Why We Win</h2>
            <p className={styles.sectionSubtitle}>Our competitive advantage is built on a professional methodology, strategic vision, and sustainable economics.</p>
        </div>
        <div className={styles.riskGrid}>
            {advantages.map((advantage, index) => (
                <motion.div
                    key={index}
                    className={styles.riskCard}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                    <div className={styles.riskIconWrapper}><advantage.icon className={styles.riskIcon} /></div>
                    <h3 className={styles.riskCardTitle}>{advantage.title}</h3>
                    <p className={styles.riskCardDescription}>{advantage.description}</p>
                </motion.div>
            ))}
        </div>
    </div>
)};

const ProductSection = () => {
    return (
      <div className={styles.sectionContent}>
        <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Our Product</h2>
            <p className={styles.sectionSubtitle}>A simple, powerful index that gives you exposure to the best of Solana.</p>
        </div>
        <div className={styles.productGrid}>
            <motion.div
                className={styles.productCard}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.6 }}
            >
                <div className={styles.productIconWrapper}><Target className={styles.productIcon} /></div>
                <h3 className={styles.productCardTitle}>Diversified Exposure</h3>
                <p className={styles.productCardDescription}>Get exposure to top Solana assets with a single token, reducing risk through diversification.</p>
            </motion.div>
            <motion.div
                className={styles.productCard}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.6, delay: 0.2 }}
            >
                <div className={styles.productIconWrapper}><Shield className={styles.productIcon} /></div>
                <h3 className={styles.productCardTitle}>Professional Management</h3>
                <p className={styles.productCardDescription}>Our index follows proven methodologies with regular rebalancing and transparent operations.</p>
            </motion.div>
            <motion.div
                className={styles.productCard}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.6, delay: 0.4 }}
            >
                <div className={styles.productIconWrapper}><TrendingUp className={styles.productIcon} /></div>
                <h3 className={styles.productCardTitle}>Growth Potential</h3>
                <p className={styles.productCardDescription}>Benefit from the growth of the entire Solana ecosystem through our carefully curated index.</p>
            </motion.div>
        </div>
    </div>
)};

const TeamSection = () => {
    const teamMembers = [
        { name: 'Jorge', role: 'Founder & CEO', image: '/jorge.jpg', description: 'Former software engineer at Google, passionate about DeFi and Solana.' },
        { name: 'Muse', role: 'CTO', image: '/muse.jpg', description: 'Blockchain developer with expertise in Solana and smart contract development.' }
    ];
    
    return (
        <div className={styles.sectionContent}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Our Team</h2>
                <p className={styles.sectionSubtitle}>Experienced professionals passionate about building the future of finance on Solana.</p>
            </div>
            <div className={styles.teamGrid}>
                {teamMembers.map((member, index) => (
                    <motion.div
                        key={index}
                        className={styles.teamCard}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 0.6, delay: index * 0.2 }}
                    >
                        <div className={styles.teamImageWrapper}>
                            <Image
                                src={member.image}
                                alt={member.name}
                                width={120}
                                height={120}
                                className={styles.teamImage}
                            />
                        </div>
                        <h3 className={styles.teamCardTitle}>{member.name}</h3>
                        <p className={styles.teamCardRole}>{member.role}</p>
                        <p className={styles.teamCardDescription}>{member.description}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

const CtaSection = () => (
    <div className={styles.sectionContent}>
        <div className={styles.ctaContent}>
            <motion.h2
                className={styles.ctaTitle}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.6 }}
            >
                Ready to join the future of Solana?
            </motion.h2>
            <motion.p
                className={styles.ctaSubtitle}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.6, delay: 0.2 }}
            >
                Get started with our demo app and see the power of our index in action.
            </motion.p>
            <motion.div
                className={styles.ctaButtons}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.6, delay: 0.4 }}
            >
                <Link href="/dashboard" className={styles.ctaButtonPrimary}>
                    Try Demo App
                </Link>
                <Link href="/challenge" className={styles.ctaButtonSecondary}>
                    View Challenge
                </Link>
            </motion.div>
        </div>
    </div>
);

export default function HomePage() {
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState<{ title: string; content: string } | null>(null);
  const [isCalendlyOpen, setIsCalendlyOpen] = useState(false);
  const calendlyRef = useRef<HTMLDivElement>(null);

  const openModal = (title: string, content: string) => {
    setModalContent({ title, content });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalContent(null);
  };

  const openCalendly = () => {
    setIsCalendlyOpen(true);
    if (calendlyRef.current) {
      calendlyRef.current.style.display = 'block';
    }
  };

  const closeCalendly = () => {
    setIsCalendlyOpen(false);
    if (calendlyRef.current) {
      calendlyRef.current.style.display = 'none';
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendlyRef.current && !calendlyRef.current.contains(event.target as Node)) {
        closeCalendly();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={styles.container}>
      <Background mouseX={0} mouseY={0} />
      <Header />
      
      <main className={styles.main}>
        <Section id="hero">
          <HeroSection />
        </Section>
        
        <Section id="why-win">
          <WhyWinSection />
        </Section>
        
        <Section id="product">
          <ProductSection />
        </Section>
        
        <Section id="team">
          <TeamSection />
        </Section>
        
        <Section id="cta">
          <CtaSection />
        </Section>
      </main>

      <Footer />
      
      <AnimatePresence>
        {showModal && modalContent && (
          <Modal
            isOpen={showModal}
            onClose={closeModal}
            type="success"
            title={modalContent.title}
            message={modalContent.content}
          />
        )}
      </AnimatePresence>

      <div
        ref={calendlyRef}
        className={`${calendlyStyles.calendlyOverlay} ${isCalendlyOpen ? calendlyStyles.active : ''}`}
        style={{ display: 'none' }}
      >
        <div className={calendlyStyles.calendlyContent}>
          <button className={calendlyStyles.closeButton} onClick={closeCalendly}>
            ×
          </button>
          <div className={calendlyStyles.calendlyInlineWidget}>
            {/* Calendly inline widget would go here */}
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <p>Calendly integration would be here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
