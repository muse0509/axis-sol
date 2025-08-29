'use client';
import React, { useState, useEffect, useRef } from 'react';
import type { NextPage } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Clock, Shield, Rocket, Flag, Target, Zap, Compass, Send, Wallet, CheckCircle, Key, Lock, Gift, Users, Mail, TrendingUp } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
// Refactored to Tailwind CSS + DaisyUI
import { Header } from '../components/Header';
import { Background } from '../components/Background';
import { Modal } from '../components/Modal';
import { Footer } from '../components/Footer';


// --- セクション別コンポーネント ---

const Section = ({ children, id }: { children: React.ReactNode, id: string }) => (
  <section
    id={id}
    className="w-full min-h-screen flex justify-center items-center py-24 px-6 relative"
    style={{ minHeight: '100vh' }}
  >
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="w-full max-w-[1100px]"
    >
      {children}
    </motion.div>
  </section>
);

const HeroSection = () => (
    <div className="text-center">
      <motion.h1
        className="text-white font-extrabold tracking-tight leading-tight text-[clamp(3rem,10vw,5.5rem)] mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        Axis is building the S&P 500 of Solana
      </motion.h1>
      <motion.p
        className="text-gray-300 mb-12 max-w-[600px] mx-auto text-[clamp(1rem,4vw,1.25rem)] leading-relaxed"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        a trusted crypto index that lets investors gain diversified exposure to the digital asset market with a single token.
      </motion.p>
      <motion.div
        className="flex gap-6 justify-center flex-wrap"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <Link href="/dashboard" className="inline-block px-8 py-4 bg-white text-black font-semibold border-2 border-transparent rounded-lg shadow-[0_4px_15px_rgba(255,255,255,0.2)] hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(255,255,255,0.3)] transition-all duration-300 cursor-pointer">
          View Demo App
        </Link>
        <a href="https://acrobat.adobe.com/id/urn:aaid:sc:AP:576b9b2d-51bb-4c45-9dae-82d78bf332e6" target="_blank" rel="noopener noreferrer" className="inline-block px-8 py-4 bg-transparent text-white border-2 border-white/50 rounded-lg hover:bg-white/10 hover:border-white transition-all duration-300 cursor-pointer">
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
    <div>
        <div className="text-center mb-16">
            <h2 className="text-[clamp(2.5rem,8vw,3.5rem)] font-bold mb-6">Why We Win</h2>
            <p className="text-gray-400 max-w-[800px] mx-auto leading-7 text-[clamp(1rem,4vw,1.1rem)]">Our competitive advantage is built on a professional methodology, strategic vision, and sustainable economics.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-[1200px] mx-auto">
            {advantages.map((advantage, index) => (
                <motion.div
                    key={index}
                    className="p-8 rounded-xl text-center border border-white/10 bg-gradient-to-br from-white/5 to-white/0 hover:-translate-y-1 hover:shadow-xl hover:border-white/20 transition-all"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                    <div className="mx-auto mb-6 w-[60px] h-[60px] rounded-full bg-sky-400/10 flex items-center justify-center">
                      <advantage.icon className="w-[30px] h-[30px] text-sky-500" />
                    </div>
                    <h3 className="text-xl font-semibold mb-4">{advantage.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{advantage.description}</p>
                </motion.div>
            ))}
        </div>
    </div>
)};

const ProductSection = () => {
    return (
      <div>
        <div className="text-center mb-16">
            <h2 className="text-[clamp(2.5rem,8vw,3.5rem)] font-bold mb-6">What We're Building</h2>
            <p className="text-gray-400 max-w-[800px] mx-auto leading-7 text-[clamp(1rem,4vw,1.1rem)]">
              Axis is building the foundational asset management layer for the Solana ecosystem. Our first product, $AXIS-INDEX, is a trusted, on-chain index fund that allows anyone to invest in Solana's growth with a single click. We turn casino-level chaos into a professional-grade financial product.
            </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mt-12">
            <motion.div
                className=""
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
                className=""
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.7, delay: 0.4 }}
            >
                <ul className="list-none p-0 m-0 flex flex-col gap-8 bg-white/5 border border-white/10 p-10 rounded-xl">
                  <li className="flex items-start gap-4 text-[1.1rem] leading-7"><TrendingUp size={20} className="text-blue-500 mt-1"/> <span><strong>Explosive Growth Opportunity:</strong> Solana is a multi-billion dollar ecosystem lacking professional-grade, passive investment tools.</span></li>
                  <li className="flex items-start gap-4 text-[1.1rem] leading-7"><CheckCircle size={20} className="text-blue-500 mt-1"/> <span><strong>Bridging TradFi & DeFi:</strong> The global asset management market is worth over $100 trillion. We are bringing its most successful model (index funds) on-chain.</span></li>
                  <li className="flex items-start gap-4 text-[1.1rem] leading-7"><Shield size={20} className="text-blue-500 mt-1"/> <span><strong>Clear, Sustainable Business Model:</strong> Revenue is tied directly to Assets Under Management (AUM), a model proven for decades in TradFi.</span></li>
                </ul>
            </motion.div>
        </div>
      </div>
    );
};

const TractionSection = () => (
    <div>
        <div className="text-center mb-16">
            <h2 className="text-[clamp(2.5rem,8vw,3.5rem)] font-bold mb-6">Proven Vision & Traction</h2>
            <p className="text-gray-400 max-w-[800px] mx-auto leading-7 text-[clamp(1rem,4vw,1.1rem)]">We're not just starting a project; we're building a movement with key ecosystem support.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div className="bg-white/5 border border-white/10 p-10 rounded-xl" initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.7, delay: 0.2 }}>
                <div className="w-[50px] h-[50px] rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center mb-6"><Zap /></div>
                <h3>Ecosystem-Validated Vision</h3>
                <p>Our vision isn't just theory. From its earliest stages, Axis has attracted the attention and support of core teams within the Solana ecosystem, including Backpack, Webacy, and MagicBlock, ensuring our foundation is robust and aligned with the market.</p>
            </motion.div>
            <motion.div className="bg-white/5 border border-white/10 p-10 rounded-xl" initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: 0.7, delay: 0.4 }}>
                <div className="w-[50px] h-[50px] rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center mb-6"><Users /></div>
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
    <div>
        <div className="text-center mb-16">
            <h2 className="text-[clamp(2.5rem,8vw,3.5rem)] font-bold mb-6">Our Roadmap</h2>
            <p className="text-gray-400 max-w-[800px] mx-auto leading-7 text-[clamp(1rem,4vw,1.1rem)]">A clear, step-by-step plan to build the asset management layer for the digital economy.</p>
        </div>
        <div className="relative max-w-[900px] mx-auto my-4">
            <div className="absolute top-0 bottom-0 left-1/2 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent -translate-x-1/2" />
            {roadmapItems.map((item, index) => (
                <div key={index} className={`relative w-1/2 px-4 box-border ${index % 2 === 0 ? 'text-right pr-12' : 'left-1/2 pl-12 text-left'} mb-16`}> 
                    <motion.div
                        className={`absolute top-0 -translate-y-1/2 w-[50px] h-[50px] rounded-full bg-[#01041a] border-2 border-white/20 flex items-center justify-center ${index % 2 === 0 ? 'right-[-25px]' : 'left-[-25px]'}`}
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    ><item.icon className="w-6 h-6 text-purple-500" /></motion.div>
                    <motion.div
                        className="p-6 bg-white/5 rounded-md"
                        initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        <p className="font-bold text-blue-500 mb-2">{item.phase}</p>
                        <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                        <p className="text-gray-400">{item.description}</p>
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
    <div>
        <div className="text-center mb-16">
            <h2 className="text-[clamp(2.5rem,8vw,3.5rem)] font-bold mb-6">Why Me? A Founder-Led Bet</h2>
            <p className="text-gray-400 max-w-[800px] mx-auto leading-7 text-[clamp(1rem,4vw,1.1rem)]">Early-stage investing is a bet on the founder. I will out-learn, out-build, and out-execute any competitor.</p>
        </div>
        <div className="flex justify-center gap-12 flex-wrap">
            {teamMembers.map((member, index) => (
                 <motion.div
                    key={member.name}
                    className="p-8 bg-white/5 border border-white/10 rounded-xl text-center w-[320px]"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                    <div className="relative w-[120px] h-[120px] mx-auto mb-6">
                        <Image src={member.image} alt={member.name} width={120} height={120} className="rounded-full object-cover" />
                        {member.isSuperTeam && (
                            <Image src="/superteam.png" alt="SuperTeam Badge" width={60} height={60} className="rounded-full absolute right-[-15px] bottom-[-15px] bg-[#01041a] p-0.5" />
                        )}
                    </div>
                    <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                    <p className="text-purple-300 mb-4">{member.role}</p>
                    <p className="text-gray-400 leading-relaxed text-sm">{member.bio}</p>
                    <div className="mt-6">
                        <a className="text-blue-500 hover:underline" href={member.link} target="_blank" rel="noopener noreferrer">X account</a>
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
    <div>
        <div className="text-center mb-16">
            <h2 className="text-[clamp(2.5rem,8vw,3.5rem)] font-bold mb-6">The Market Can Finally Grow Up.</h2>
            <p className="text-gray-400 max-w-[800px] mx-auto leading-7 text-[clamp(1rem,4vw,1.1rem)]">Because the guide has arrived. Join us to be part of the journey.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-12 items-center mt-12">
            <div className="text-left">
                <h4>By joining, you become eligible for:</h4>
                <ul className="list-none p-0 m-0 flex flex-col gap-5">
                    <li className="flex items-center gap-4 text-[1.1rem]"><Key size={20} className="text-purple-300"/> <span>Early access to our beta platform.</span></li>
                    <li className="flex items-center gap-4 text-[1.1rem]"><Gift size={20} className="text-purple-300"/> <span>Future airdrops and community rewards.</span></li>
                    <li className="flex items-center gap-4 text-[1.1rem]"><Lock size={20} className="text-purple-300"/> <span>A secured spot for upcoming product launches.</span></li>
                </ul>
                <p className="mt-8 text-sm text-gray-500 italic">We respect your privacy. We only store your wallet address and nothing else.</p>
            </div>

            <div className="max-w-[550px] mx-0 p-10 bg-white/5 border border-white/10 rounded-xl text-center flex flex-col items-center gap-6">
                {!connected ? (
                    <>
                        <p>Connect your wallet to get started.</p>
                        <button onClick={handleConnectClick} className="inline-block px-10 py-4 bg-white text-black font-semibold rounded-lg hover:-translate-y-1 hover:shadow-[0_8px_25px_rgba(255,255,255,0.3)] transition-all duration-300 cursor-pointer">
                            <Wallet size={20} /> Connect Wallet
                        </button>
                    </>
                ) : (
                    <>
                        <div className="flex items-center gap-4 bg-black/30 px-4 py-2 rounded-md border border-white/10">
                            <span>Connected as:</span>
                            <code>{shortenAddress(publicKey!.toBase58())}</code>
                            <button onClick={() => disconnect()} className="inline-block px-3 py-1 bg-transparent text-gray-400 underline hover:text-white transition-colors duration-200 cursor-pointer">Disconnect</button>
                        </div>

                        {!isJoined ? (
                            <button onClick={handleJoin} className="inline-block px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed" disabled={isSubmitting}>
                                {isSubmitting ? 'Submitting...' : <><Send size={18} /> Join the Community</>}
                            </button>
                        ) : (
                            <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="">
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
    <div className="py-24 px-6 bg-black text-white text-center">
        <div className="w-full max-w-[1100px] mx-auto">
            <div className="text-center mb-16">
                <h2 className="text-[clamp(2.5rem,8vw,3.5rem)] font-bold mb-6">Interested in Learning More?</h2>
                <p className="text-gray-400 max-w-[800px] mx-auto leading-7 text-[clamp(1rem,4vw,1.1rem)]">
                    Schedule a call with the founder to discuss our vision, strategy, and the angel round.
                </p>
            </div>
            <div
                className="h-[700px] border border-white/20 rounded-xl overflow-hidden"
                dangerouslySetInnerHTML={{
                    __html: `<iframe
                        src="https://calendly.com/yusukekikuta-05/axis-pitch"
                        width="100%"
                        height="100%"
                        frameborder="0"
                    ></iframe>`
                }}
            />
             <div className="flex gap-6 justify-center mt-6">
                <a href="mailto:yusukekikuta.05@gmail.com" className="link link-hover inline-flex items-center gap-2"><Mail size={18} /> yusukekikuta.05@gmail.com</a>
                <a href="https://t.me/yus0509" target="_blank" rel="noopener noreferrer" className="link link-hover inline-flex items-center gap-2"><Send size={18} /> @yus0509 on Telegram</a>
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
            className="fixed inset-0 bg-black flex items-center justify-center z-[1000]"
            exit={{ opacity: 0, filter: 'blur(20px)' }}
            transition={{ duration: 1.2, ease: 'circOut' }}
          >
            <div className="text-white text-center p-4 text-[clamp(2rem,10vw,6rem)] font-bold">
              {typewriterText}
              <span className="inline-block w-[0.1em] ml-[0.1em] bg-white animate-blink-cursor"></span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

          {!isLoading && (
              <div className="relative bg-black text-white min-h-screen">
              <Header />
              <Background mouseX={mousePosition.x} mouseY={mousePosition.y} />

              <main className="w-full relative z-10 min-h-screen">
                {sections.map((section) => (
                  <Section key={section.id} id={section.id}>
                    <section.component />
                  </Section>
                ))}
              </main>
                <Footer />
              </div>
          )}
        </>
      );
    };

    export default AxisLandingPage;