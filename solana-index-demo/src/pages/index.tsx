import React, { useState, useEffect, useRef } from 'react';
import type { NextPage } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Clock, Shield, Rocket, Flag, Target, Zap, Compass, Send, Wallet, CheckCircle, Key, Lock, Gift } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui'; 
import styles from '../styles/Landing.module.css';
import { Header } from '../components/Header';
import { Background } from '../components/Background';
import { Modal } from '../components/Modal';
import { Footer } from '../components/Footer'; 

// --- セクション別コンポーネント ---
// (これらのコンポーネント定義は変更ありません)

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
        Buy the<br />
        <span className={styles.heroTitleGradientLarge}>Crypto market.</span>
      </motion.h1>
      <motion.p 
        className={styles.heroSubtitleLarge}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        Axis Protocol illuminates true risk,<br />building a foundation for stable, informed growth.
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
        { icon: Brain, title: 'The "Mental Cost" of Volatility', description: "A 30% drawdown isn't just a number. It's the anxiety that clouds judgment." },
        { icon: Clock, title: 'The "Time Cost" of Opportunity Loss', description: 'Focusing solely on one asset means missing out on countless other growth opportunities.' },
        { icon: Shield, title: 'The "Structural Cost" of Concentration', description: 'Savvy investors prioritize avoiding critical losses over maximizing every potential gain.' }
    ];
    return(
    <div className={styles.sectionContent}>
        <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>The Invisible Costs</h2>
            <p className={styles.sectionSubtitle}>We celebrate the wins, but often overlook the hidden prices we pay along the way.</p>
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
    // 表示するロゴのリストを定義
    const logos = [
      { src: '/solana.png', alt: 'Solana' },
      { src: '/ethereum.png', alt: 'Ethereum' },
      { src: '/base.svg', alt: 'Base' },
      { src: '/polygon.png', alt: 'Polygon' },
    ];
  
    return (
      <div className={styles.sectionContent}>
        {/* --- セクションヘッダー (変更なし) --- */}
        <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>The Power of the Market, in a Single Token.</h2>
            <p className={styles.sectionSubtitle}>
              We designed a transparent, equally-weighted index from a basket of high-quality crypto assets. 
              This is tracked by a single, fully-collateralized token, allowing you to invest in the growth of the entire ecosystem with a disciplined, passive strategy.
            </p>
        </div>
    
        {/* --- 2カラムのレイアウト (変更なし) --- */}
        <div className={styles.productGrid}>
            <motion.div 
                className={styles.productConcept}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.7, delay: 0.2 }}
            >
                <h3>Our Advantage: True Decentralization</h3>
                <p>
                  While other index products rely on centralized vaults and complex bridging, Axis is built on a foundation of true cross-chain interoperability.
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
                  <li><CheckCircle size={20}/> <strong>Unified Access:</strong> Buy, sell, and use the Axis Index Token on any supported chain without wrapping or bridging.</li>
                  <li><CheckCircle size={20}/> <strong>Deep Liquidity:</strong> By tapping into native USDC on each chain, we ensure robust liquidity and minimal slippage.</li>
                  <li><CheckCircle size={20}/> <strong>Simplified UX:</strong> A seamless experience for users, no matter which ecosystem they prefer. This is the key to mass adoption.</li>
                </ul>
            </motion.div>
        </div>

        {/* ★★★ ここから回転ロゴ帯の代わりに、新しいタイムライン風レイアウトを追加 ★★★ */}
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
                                    fill // widthとheightの代わりにfillを使用
                                    style={{ objectFit: 'contain' }} // アスペクト比を維持
                                />
                            
                        </motion.div>
                    </div>
                ))}
            </div>
        </div>
        {/* ★★★ タイムライン風レイアウトはここまで ★★★ */}

      </div>
    );
};
const WhyIndexSection = () => (
    <div className={styles.sectionContent}>
        <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Why an Index? Why Now?</h2>
            <p className={styles.sectionSubtitle}>In a complex market, simplicity is the ultimate sophistication.</p>
        </div>
        <div className={styles.whyLayout}>
            <motion.div 
                className={styles.whyCard}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.7, delay: 0.2 }}
            >
                <div className={styles.whyIconWrapper}><Zap /></div>
                <h3>Why Now? The Market Has Matured.</h3>
                <p>The crypto space is no longer just about one or two assets. A diverse, vibrant ecosystem of projects is thriving. It's time for an investment tool that reflects this new reality, moving beyond single-asset speculation to capture the pulse of the entire market.</p>
            </motion.div>
            <motion.div
                className={styles.whyCard}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.7, delay: 0.4 }}
            >
                <div className={styles.whyIconWrapper}><Compass /></div>
                <h3>Why an Index? For Clarity and Stability.</h3>
                <p>An index product is the most effective way to manage risk through automatic diversification. It removes the guesswork and emotional trading, offering a disciplined, passive strategy to gain exposure to the market's collective growth. It's not just an investment; it's a compass.</p>
            </motion.div>
        </div>
    </div>
);

const RoadmapSection = () => {
    const roadmapItems = [
        { icon: Flag, phase: "Phase 1: Foundation (Q4 2025)", title: "Core Protocol Launch", description: "Deployment of the initial Axis risk management framework on the Solana mainnet." },
        // --- ここを修正 ---
        { icon: Target, phase: "Phase 2: Market Entry (Q1 2026)", title: "DEX Listing & Partner Integrations", description: "Making the Axis Index Token tradable on major DEXs like Jupiter & Orca, and starting integrations to have it accepted as collateral across the DeFi ecosystem." },
        // --- ここまで ---
        { icon: Rocket, phase: "Phase 3: Ecosystem Growth (Q2 2026 & Beyond)", title: "Multi-Chain Integration", description: "Expanding the Axis philosophy and products to other leading blockchain ecosystems." },
    ];
  return (
    <div className={styles.sectionContent}>
        <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Our Roadmap</h2>
            <p className={styles.sectionSubtitle}>A clear path forward, focused on delivering robust risk management solutions.</p>
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
        { name: "Muse", role: "Founder & Web3 Dev", bio: "Solana ecosystem builder with a vision for safer, more accessible DeFi through proactive risk management.", image: "/muse.jpg", link: "https://x.com/muse_0509", isSuperTeam: true },
        { name: "Jorge", role: "Data Scientist & Developer", bio: "I am a college student currently living in Japan. Introduced by our founder Muse, I have joined the Axis team to contribute to the growth of the Solana ecosystem.", image: "/jorge.jpg", link: "https://x.com/jorge__37348", isSuperTeam: false }
    ];
    return(
    <div className={styles.sectionContent}>
        <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Our Team</h2>
            <p className={styles.sectionSubtitle}>A dedicated team passionate about bringing transparent risk management to DeFi.</p>
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
            <h2 className={styles.sectionTitle}>Join the Genesis Program</h2>
            <p className={styles.sectionSubtitle}>Your Solana address is your passport to the Axis ecosystem. No email required.</p>
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
    const [currentSection, setCurrentSection] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(false); // ★ 1. isMobile stateを追加
    const fullText = "It's the risk you don't see that matters.";
    const [typewriterText, setTypewriterText] = useState('');
    const isWheeling = useRef(false);
    const touchStartY = useRef(0);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [modalState, setModalState] = useState({ isOpen: false, type: 'success' as 'success' | 'error', title: '', message: '' });

  
    const sections = [
      { id: 'hero', component: HeroSection },
      { id: 'risks', component: RisksSection },
      { id: 'product', component: ProductSection },
      { id: 'why', component: WhyIndexSection },
      { id: 'roadmap', component: RoadmapSection },
      { id: 'team', component: TeamSection },
      { id: 'waitlist', component: () => <WaitlistSection setModalState={setModalState} /> },
 
    ];
  
    // ★ 2. デバイスの幅を監視し、isMobile state を更新する useEffect
    useEffect(() => {
      const handleResize = () => {
        setIsMobile(window.innerWidth <= 768);
      };
  
      handleResize(); // 初期表示時にも判定を実行
      window.addEventListener('resize', handleResize);
  
      // コンポーネントがアンマウントされる時にリスナーを削除
      return () => window.removeEventListener('resize', handleResize);
    }, []); // このEffectはマウント時に一度だけ実行
  
    // タイプライターアニメーション
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
  
   
    // マウス追跡
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => setMousePosition({ x: e.clientX, y: e.clientY });
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);
  
    return (
        <>
          {/* ★★★ モーダルをページの一番上の階層で呼び出す ★★★ */}
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
                <Header setCurrentSection={setCurrentSection} />
                <Background mouseX={mousePosition.x} mouseY={mousePosition.y} />
                
                <div className={styles.sectionsWrapper} style={{ transform: `translateY(-${currentSection * 100}vh)` }}>
                  {sections.map((section, index) => (
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
  