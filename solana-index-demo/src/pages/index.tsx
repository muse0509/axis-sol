import React, { useState, useEffect, useRef } from 'react';
import type { NextPage } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Clock, Shield, Rocket, Flag, Target, Zap, Compass, Send, Wallet, CheckCircle, Key, Lock, Gift, Users } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import styles from '../styles/Landing.module.css';
import { Header } from '../components/Header';
import { Background } from '../components/Background';
import { Modal } from '../components/Modal';
import { Footer } from '../components/Footer';


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
        Markets can't grow up<br />
        <span className={styles.heroTitleGradientLarge}>without a good guide.</span>
      </motion.h1>
      <motion.p
        className={styles.heroSubtitleLarge}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        This is Axis. We are building a new foundation for stable, informed growth in the crypto market.
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
        <a href="https://muse-7.gitbook.io/axiswhitepaper/" target="_blank" rel="noopener noreferrer" className={styles.ctaButtonSecondary}>
          View Whitepaper →
        </a>
      </motion.div>
    </div>
  );


const RisksSection = () => {
    const risks = [
        { icon: Brain, title: 'The Illusion of Single-Asset Bets', description: "Thinking you'll get rich just by holding Bitcoin is a common mistake. A single asset's fall can hurt investors badly." },
        { icon: Clock, title: 'The Game of Survival', description: 'The market is a zero-sum game. To build wealth, you must play safe and prioritize stability, not just chase risky high returns.' },
        { icon: Shield, title: 'The Goal: Stability Over Hype', description: 'The biggest success in a volatile market isn\'t chasing the highest peak. It\'s achieving stability to survive and win over time.' }
    ];
    return(
    <div className={styles.sectionContent}>
        <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>The Unspoken Rules of Crypto</h2>
            <p className={styles.sectionSubtitle}>To win, you must first understand the game. The most important rule is to play safe.</p>
        </div>
        <div className={styles.riskGrid}>
            {risks.map((risk, index) => (
                <motion.div
                    key={index}
                    className={styles.riskCard}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                    <div className={styles.riskIconWrapper}><risk.icon className={styles.riskIcon} /></div>
                    <h3 className={styles.riskCardTitle}>{risk.title}</h3>
                    <p className={styles.riskCardDescription}>{risk.description}</p>
                </motion.div>
            ))}
        </div>
    </div>
)};

const ProductSection = () => {
    const logos = [
      { src: '/solana.png', alt: 'Solana' },
      { src: '/ethereum.png', alt: 'Ethereum' },
      { src: '/Base.svg', alt: 'Base' },
      { src: '/polygon.png', alt: 'Polygon' },
    ];
  
    return (
      <div className={styles.sectionContent}>
        <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>The Solution We Need Now: An Index</h2>
            <p className={styles.sectionSubtitle}>
              That's why we are building Axis. Our product is simple: we create transparent indexes with clear rules, then package them into a single token. Anyone can buy the market in one easy step.
            </p>
        </div>

        <div className={styles.productGrid}>
            <motion.div
                className={styles.productConcept}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.7, delay: 0.2 }}
            >
                <h3>Our Vision: A Public Good</h3>
                <p>
                  Our real goal is bigger. We are creating the index itself and giving it to the market as a trusted, open standard that anyone can use to build upon.
                </p>
            </motion.div>
            <motion.div
                className={styles.productFeatures}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.7, delay: 0.4 }}
            >
                <ul>
                  <li><CheckCircle size={20}/> <strong>Truly Decentralized:</strong> While others are limited to a single chain or use complex bridges, Axis has a multi-chain plan from day one.</li>
                  <li><CheckCircle size={20}/> <strong>Fair & Transparent:</strong> Our model is designed to benefit everyone. We charge a small, fair fee to help the project and its users grow.</li>
                  <li><CheckCircle size={20}/> <strong>Built on Solana, For Everyone:</strong> We are Solana experts with a vision to bring our robust risk management to all major chains.</li>
                </ul>
            </motion.div>
        </div>

        <div className={styles.chainTimelineWrapper}>
            <h4 className={styles.chainTimelineTitle}>Natively Supported Chains</h4>
            <div className={styles.chainTimeline}>
                <div className={styles.chainTimelineConnector}></div>
                {logos.map((logo, index) => (
                    <div
                        key={logo.alt}
                        className={`${styles.chainTimelineItem} ${index % 2 === 0 ? styles.chainTimelineItemLeft : styles.chainTimelineItemRight}`}
                    >
                         <motion.div
                            initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, amount: 0.5 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className={styles.chainLogoCard}
                        >
                            <Image
                                    src={logo.src}
                                    alt={logo.alt}
                                    fill
                                    style={{ objectFit: 'contain' }}
                                />

                        </motion.div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    );
};

const TractionSection = () => (
    <div className={styles.sectionContent}>
        <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Traction & Community</h2>
            <p className={styles.sectionSubtitle}>We're not just starting a project; we're building a movement.</p>
        </div>
        <div className={styles.whyLayout}>
            <motion.div className={styles.whyCard} initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.7, delay: 0.2 }}>
                <div className={styles.whyIconWrapper}><Zap /></div>
                <h3>Expert-Validated Vision</h3>
                <p>Our approach isn't just theory. From its earliest concept stages, Axis has received valuable technical feedback from seasoned members of the Backpack team and MagicBlock, ensuring our foundation is robust, secure, and ready to scale.</p>
            </motion.div>
            <motion.div className={styles.whyCard} initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.7, delay: 0.4 }}>
                <div className={styles.whyIconWrapper}><Users /></div>
                <h3>A Growing Community</h3>
                <p>Our mission has already attracted a strong and growing community of over 100 early supporters who believe in a more stable and transparent future for DeFi.</p>
            </motion.div>
        </div>
    </div>
);

const RoadmapSection = () => {
    const roadmapItems = [
        { icon: Flag, phase: "Phase 1: Foundation", title: "Secure the Protocol with Grant Funding", description: "Utilize grant funding to rigorously build, test, and audit the core Axis protocol, ensuring maximum safety and reliability from day one." },
        { icon: Target, phase: "Phase 2: Launch & Seed Round", title: "Launch, List, and Acquire First Users", description: "Raise seed funding to officially launch the Axis Index Token, secure listings on major DEXs, and onboard our initial user base through strategic partnerships." },
        { icon: Rocket, phase: "Phase 3: Scale & Profit", title: "Expand and Grow the Ecosystem", description: "Raise a subsequent funding round to expand to new chains, introduce new products, and scale towards profitability and long-term sustainability." },
    ];
  return (
    <div className={styles.sectionContent}>
        <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Our Roadmap</h2>
            <p className={styles.sectionSubtitle}>A clear, step-by-step plan to bring stability to the crypto world.</p>
        </div>
        <div className={styles.timeline}>
            <div className={styles.timelineConnector} />
            {roadmapItems.map((item, index) => (
                <div key={index} className={`${styles.timelineItem} ${index % 2 === 0 ? styles.timelineItemLeft : styles.timelineItemRight}`}>
                    <motion.div
                        className={styles.timelineIconWrapper}
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    ><item.icon className={styles.timelineIcon} /></motion.div>
                    <motion.div
                        className={styles.timelineContent}
                        initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        <p className={styles.timelinePhase}>{item.phase}</p>
                        <h3 className={styles.timelineTitle}>{item.title}</h3>
                        <p className={styles.timelineDescription}>{item.description}</p>
                    </motion.div>
                </div>
            ))}
        </div>
    </div>
  )
};

const TeamSection = () => {
    const teamMembers = [
        { name: "Muse", role: "Founder & Full-Stack Dev", bio: "A founder who knows how to win. I led my team to a first-place victory in a major hackathon with 158 competing teams, and I am now dedicated full-time to making Axis a success.", image: "/muse.jpg", link: "https://x.com/muse_0509", isSuperTeam: true },
    ];
    return(
    <div className={styles.sectionContent}>
        <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>The Right Person for the Job</h2>
        </div>
        <div className={styles.teamGrid}>
            {teamMembers.map((member, index) => (
                 <motion.div
                    key={member.name}
                    className={styles.teamCard}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                    <div className={styles.teamPfpContainer}>
                        <Image src={member.image} alt={member.name} width={120} height={120} className={styles.teamPfp} />
                        {member.isSuperTeam && (
                            <Image src="/superteam.png" alt="SuperTeam Badge" width={60} height={60} className={styles.superTeamBadge} />
                        )}
                    </div>
                    <h3 className={styles.teamName}>{member.name}</h3>
                    <p className={styles.teamRole}>{member.role}</p>
                    <p className={styles.teamBio}>{member.bio}</p>
                    <div className={styles.teamSocial}>
                        <a href={member.link} target="_blank" rel="noopener noreferrer">X account</a>
                    </div>
                </motion.div>
            ))}
        </div>
    </div>
)};

const WaitlistSection = ({ setModalState }: { setModalState: any }) => {
    const { connected, publicKey, disconnect } = useWallet();
    const { setVisible } = useWalletModal();
    const [isJoined, setIsJoined] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleJoin = async () => {
        if (!publicKey) return;
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/join-waitlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address: publicKey.toBase58() }),
            });
            const result = await response.json();
            if (response.ok) {
                setIsJoined(true);
                setModalState({ isOpen: true, type: 'success', title: 'Welcome to the Waitlist!', message: 'You will be notified of early access and future rewards. Thank you for your support!' });
            } else {
                setModalState({ isOpen: true, type: 'error', title: 'Oops!', message: result.message || 'An error occurred. Please try again.' });
            }
        } catch (err) {
            console.error("Failed to join waitlist:", err);
            setModalState({ isOpen: true, type: 'error', title: 'Error', message: 'An unexpected error occurred.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleConnectClick = () => {
        setVisible(true);
    };

    const shortenAddress = (address: string) => `${address.slice(0, 4)}...${address.slice(-4)}`;

    return(
    <div className={styles.sectionContent}>
        <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>The Market Can Finally Grow Up.</h2>
            <p className={styles.sectionSubtitle}>Because the guide has arrived. Join the Genesis Program to be part of the journey.</p>
        </div>
        <div className={styles.waitlistLayout}>
            <div className={styles.benefitsContainer}>
                <h4>By joining, you become eligible for:</h4>
                <ul className={styles.benefitsList}>
                    <li><Key size={20} /> <span>Early access to our beta platform.</span></li>
                    <li><Gift size={20} /> <span>Future airdrops and community rewards.</span></li>
                    <li><Lock size={20} /> <span>A secured spot for upcoming product launches.</span></li>
                </ul>
                <p className={styles.privacyNote}>We respect your privacy. We only store your wallet address and nothing else.</p>
            </div>

            <div className={styles.waitlistContainer}>
                {!connected ? (
                    <>
                        <p>Connect your wallet to get started.</p>
                        <button onClick={handleConnectClick} className={styles.customWalletButton}>
                            <Wallet size={20} /> Connect Wallet
                        </button>
                    </>
                ) : (
                    <>
                        <div className={styles.connectedWalletInfo}>
                            <span>Connected as:</span>
                            <code>{shortenAddress(publicKey!.toBase58())}</code>
                            <button onClick={() => disconnect()} className={styles.disconnectButton}>Disconnect</button>
                        </div>

                        {!isJoined ? (
                            <button onClick={handleJoin} className={styles.ctaButtonPrimary} disabled={isSubmitting}>
                                {isSubmitting ? 'Submitting...' : <><Send size={18} /> Join the Program</>}
                            </button>
                        ) : (
                            <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className={styles.successMessage}>
                                <p>✅ Welcome! You're on the list.</p>
                            </motion.div>
                        )}
                    </>
                )}
            </div>
        </div>
    </div>
    );
};

const AxisLandingPage: NextPage = () => {

    const [isLoading, setIsLoading] = useState(true);
    const fullText = "Because markets can’t grow up without a good guide.";
    const [typewriterText, setTypewriterText] = useState('');
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [modalState, setModalState] = useState({ isOpen: false, type: 'success' as 'success' | 'error', title: '', message: '' });


    const sections = [
      { id: 'hero', component: HeroSection },
      { id: 'risks', component: RisksSection },
      { id: 'product', component: ProductSection },
      { id: 'traction', component: TractionSection },
      { id: 'roadmap', component: RoadmapSection },
      { id: 'team', component: TeamSection },
      { id: 'waitlist', component: () => <WaitlistSection setModalState={setModalState} /> },
    ];

    useEffect(() => {
      let index = 0;
      const timer = setInterval(() => {
        if (index < fullText.length) {
          setTypewriterText(fullText.slice(0, index + 1));
          index++;
        } else {
          clearInterval(timer);
          setTimeout(() => setIsLoading(false), 1200);
        }
      }, 120);
      return () => clearInterval(timer);
    }, []);


    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => setMousePosition({ x: e.clientX, y: e.clientY });
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <>
          <Modal
              isOpen={modalState.isOpen}
              onClose={() => setModalState({ ...modalState, isOpen: false })}
              type={modalState.type}
              title={modalState.title}
              message={modalState.message}
          />
         <AnimatePresence>
        {isLoading && (
          <motion.div
            className={styles.loadingContainerLarge}
            exit={{ opacity: 0, filter: 'blur(20px)' }}
            transition={{ duration: 1.2, ease: 'circOut' }}
          >
            <div className={styles.loadingTextLarge}>
              {typewriterText}
              <span className={styles.loadingCursor}></span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

          {!isLoading && (
              <div className={styles.fullPageContainer}>
              <Header />
              <Background mouseX={mousePosition.x} mouseY={mousePosition.y} />

              <div className={styles.sectionsWrapper}>
                {sections.map((section) => (
                  <Section key={section.id} id={section.id}>
                    <section.component />
                  </Section>
                ))}
              </div>
                <Footer />
              </div>
          )}
        </>
      );
    };

    export default AxisLandingPage;