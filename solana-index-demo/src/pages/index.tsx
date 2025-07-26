import React, { useState, useEffect, useRef } from 'react';
import type { NextPage } from 'next';
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
            <h2 className={styles.sectionTitle}>What We're Building</h2>
            <p className={styles.sectionSubtitle}>
              Axis is building the foundational asset management layer for the Solana ecosystem. Our first product, $AXIS-INDEX, is a trusted, on-chain index fund that allows anyone to invest in Solana's growth with a single click. We turn casino-level chaos into a professional-grade financial product.
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
                <h3>Our Vision: The Asset Management Layer for the Digital Economy</h3>
                <p>
                  Axis is more than a single fund. We are building the rails for a suite of sophisticated, passive investment products, becoming the on-chain equivalent of the S&P 500 for a new generation of investors.
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
                  <li><TrendingUp size={20}/> <strong>Explosive Growth Opportunity:</strong> Solana is a multi-billion dollar ecosystem lacking professional-grade, passive investment tools.</li>
                  <li><CheckCircle size={20}/> <strong>Bridging TradFi & DeFi:</strong> The global asset management market is worth over $100 trillion. We are bringing its most successful model (index funds) on-chain.</li>
                  <li><Shield size={20}/> <strong>Clear, Sustainable Business Model:</strong> Revenue is tied directly to Assets Under Management (AUM), a model proven for decades in TradFi.</li>
                </ul>
            </motion.div>
        </div>
      </div>
    );
};

const TractionSection = () => (
    <div className={styles.sectionContent}>
        <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Proven Vision & Traction</h2>
            <p className={styles.sectionSubtitle}>We're not just starting a project; we're building a movement with key ecosystem support.</p>
        </div>
        <div className={styles.whyLayout}>
            <motion.div className={styles.whyCard} initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.7, delay: 0.2 }}>
                <div className={styles.whyIconWrapper}><Zap /></div>
                <h3>Ecosystem-Validated Vision</h3>
                <p>Our vision isn't just theory. From its earliest stages, Axis has attracted the attention and support of core teams within the Solana ecosystem, including Backpack, Webacy, and MagicBlock, ensuring our foundation is robust and aligned with the market.</p>
            </motion.div>
            <motion.div className={styles.whyCard} initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.7, delay: 0.4 }}>
                <div className={styles.whyIconWrapper}><Users /></div>
                <h3>A Growing Community</h3>
                <p>Our mission has already attracted a strong and growing community of over 100 early supporters who believe in a more stable and transparent future for on-chain investing.</p>
            </motion.div>
        </div>
    </div>
);

const RoadmapSection = () => {
    const roadmapItems = [
        { icon: Flag, phase: "2025 Q4: Foundation", title: "Protocol Built & Secured", description: "Complete smart contract development, pass multiple top-tier security audits, and finalize the global-first legal structure in Dubai." },
        { icon: Target, phase: "2026 Q1: Launch", title: "Mainnet Launch & Initial Adoption", description: "Launch the $AXIS-INDEX on mainnet and drive early AUM growth through the strategic 'Genesis Investor' airdrop campaign." },
        { icon: Rocket, phase: "2026 Q2: Growth", title: "Scale & Integrate", description: "Achieve the milestone of $1M AUM and secure key partnerships with leading wallets and DeFi protocols to expand our reach." },
        { icon: Compass, phase: "2026 Q3: Decentralization", title: "Empower the Community", description: "Launch $AXIS staking and governance features to decentralize control. Begin research and development for the next wave of products." },
    ];
  return (
    <div className={styles.sectionContent}>
        <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Our Roadmap</h2>
            <p className={styles.sectionSubtitle}>A clear, step-by-step plan to build the asset management layer for the digital economy.</p>
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
        { name: "Yusuke Kikuta", role: "Founder", bio: "A founder with a rare combination of obsessive focus, proven technical execution, and extreme learning agility. A self-taught engineer who transitioned from a 13-year career in music to independently building a successful freelance blockchain development career. This obsessive focus and resilience are our ultimate competitive advantages.", image: "/muse.jpg", link: "https://x.com/muse_0509", isSuperTeam: true },
    ];
    return(
    <div className={styles.sectionContent}>
        <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Why Me? A Founder-Led Bet</h2>
            <p className={styles.sectionSubtitle}>Early-stage investing is a bet on the founder. I will out-learn, out-build, and out-execute any competitor.</p>
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
                setModalState({ isOpen: true, type: 'success', title: 'Welcome!', message: 'You will be notified of early access and future rewards. Thank you for your support!' });
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
            <p className={styles.sectionSubtitle}>Because the guide has arrived. Join us to be part of the journey.</p>
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
                                {isSubmitting ? 'Submitting...' : <><Send size={18} /> Join the Community</>}
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
const CalendlySection = () => (
    <div className={calendlyStyles.calendlySection}>
        <div className={styles.sectionContent}>
            <div className={styles.sectionHeader}>
                <h2 className={calendlyStyles.calendlyTitle}>Interested in Learning More?</h2>
                <p className={calendlyStyles.calendlySubtitle}>
                    Schedule a call with the founder to discuss our vision, strategy, and the angel round.
                </p>
            </div>
            <div
                className={calendlyStyles.calendlyEmbed}
                dangerouslySetInnerHTML={{
                    __html: `<iframe
                        src="https://calendly.com/yusukekikuta-05/axis-pitch"
                        width="100%"
                        height="100%"
                        frameborder="0"
                    ></iframe>`
                }}
            />
             <div className={styles.contactDirect}>
                <a href="mailto:yusukekikuta.05@gmail.com" className={styles.contactLink}><Mail size={18} /> yusukekikuta.05@gmail.com</a>
                <a href="https://t.me/yus0509" target="_blank" rel="noopener noreferrer" className={styles.contactLink}><Send size={18} /> @yus0509 on Telegram</a>
            </div>
        </div>
    </div>
);

const AxisLandingPage: NextPage = () => {

    const [isLoading, setIsLoading] = useState(true);
    const fullText = "Because markets can’t grow up without a good guide.";
    const [typewriterText, setTypewriterText] = useState('');
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [modalState, setModalState] = useState({ isOpen: false, type: 'success' as 'success' | 'error', title: '', message: '' });


    const sections = [
      { id: 'hero', component: HeroSection },
      { id: 'why-win', component: WhyWinSection },
      { id: 'product', component: ProductSection },
      { id: 'traction', component: TractionSection },
      { id: 'roadmap', component: RoadmapSection },
      { id: 'team', component: TeamSection },
      { id: 'waitlist', component: () => <WaitlistSection setModalState={setModalState} /> },
      { id: 'booking', component: CalendlySection },
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