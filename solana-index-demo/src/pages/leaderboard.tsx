import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import toast from 'react-hot-toast';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Background } from '../components/Background';
import styles from '../styles/Landing.module.css';

interface LeaderboardEntry {
  address: string;
  count: number;
}

interface UserReferralData {
  address: string;
  referralCount: number;
  referredAddresses: string[];
}

function fmtAddr(address: string) {
  if (!address) return '';
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

export default function Leaderboard() {
  const { publicKey, connected } = useWallet();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userStats, setUserStats] = useState<UserReferralData | null>(null);
  const [referralLink, setReferralLink] = useState('');
  const [loading, setLoading] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/referral');
      const data = await response.json();
      
      if (response.ok) {
        setLeaderboard(data.leaderboard || []);
      } else {
        console.error('Failed to fetch leaderboard:', data.error);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const fetchUserStats = async (address: string) => {
    try {
      const response = await fetch(`/api/referral?address=${address}`);
      const data = await response.json();
      
      if (response.ok) {
        setUserStats(data);
      } else {
        console.error('Failed to fetch user stats:', data.error);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchLeaderboard();
      
      if (connected && publicKey) {
        await fetchUserStats(publicKey.toBase58());
        setReferralLink(`${window.location.origin}?ref=${publicKey.toBase58()}`);
      }
      
      setLoading(false);
    };

    loadData();
  }, [connected, publicKey]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success('Referral link copied to clipboard!');
  };

  const getUserRank = () => {
    if (!userStats || !connected) return null;
    const rank = leaderboard.findIndex(entry => entry.address === userStats.address) + 1;
    return rank > 0 ? rank : null;
  };

  if (loading) {
    return (
      <div className={styles.loadingContainerLarge}>
        <div className={styles.loadingTextLarge}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={styles.fullPageContainer}>
      <Header />
      <Background mouseX={mousePosition.x} mouseY={mousePosition.y} />
      
      <div className={styles.section}>
        <div className={styles.sectionContent} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Header */}
          <div className={styles.sectionHeader}>
            <h1 className={styles.sectionTitle}>
              <span className={styles.heroTitleGradientLarge}>AXIS</span> Referral Leaderboard
            </h1>
            <p className={styles.sectionSubtitle}>
              Invite friends to join AXIS and explore decentralized index investing together
            </p>
          </div>

          {/* Wallet Connection */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '3rem' }}>
            <WalletMultiButton className={styles.customWalletButton} />
          </div>

          {/* User Stats Card */}
          {connected && userStats && (
            <div className={styles.waitlistContainer} style={{ maxWidth: '800px', marginBottom: '3rem', margin: '0 auto 3rem auto' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem', color: 'white', textAlign: 'center' }}>
                Your Referral Stats
              </h2>
              
              <div className={styles.riskGrid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '2rem', justifyItems: 'center' }}>
                <div className={styles.riskCard}>
                  <div className={styles.riskIconWrapper}>
                    <span style={{ fontSize: '1.5rem' }}>📊</span>
                  </div>
                  <div className={styles.riskCardTitle} style={{ fontSize: '2.5rem', color: '#a78bfa' }}>
                    {userStats.referralCount}
                  </div>
                  <div className={styles.riskCardDescription}>Successful Referrals</div>
                </div>
                
                <div className={styles.riskCard}>
                  <div className={styles.riskIconWrapper}>
                    <span style={{ fontSize: '1.5rem' }}>🏆</span>
                  </div>
                  <div className={styles.riskCardTitle} style={{ fontSize: '2.5rem', color: '#3b82f6' }}>
                    #{getUserRank() || 'N/A'}
                  </div>
                  <div className={styles.riskCardDescription}>Current Rank</div>
                </div>
                
                <div className={styles.riskCard}>
                  <div className={styles.riskIconWrapper}>
                    <span style={{ fontSize: '1.5rem' }}>👤</span>
                  </div>
                  <div className={styles.riskCardTitle} style={{ fontSize: '1.5rem', color: '#10b981' }}>
                    {fmtAddr(userStats.address)}
                  </div>
                  <div className={styles.riskCardDescription}>Your Address</div>
                </div>
              </div>
              
              {/* Referral Link */}
              <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
                <label style={{ display: 'block', color: 'white', fontSize: '1.1rem', fontWeight: '500', marginBottom: '1rem', textAlign: 'center' }}>
                  Your Referral Link:
                </label>
                <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
                  <input
                    type="text"
                    value={referralLink}
                    readOnly
                    style={{
                      flex: 1,
                      padding: '0.75rem 1rem',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '0.5rem',
                      color: 'white',
                      fontSize: '0.9rem',
                      textAlign: 'center'
                    }}
                  />
                  <button
                    onClick={copyReferralLink}
                    className={styles.ctaButtonPrimary}
                    style={{ padding: '0.75rem 1.5rem', fontSize: '0.9rem' }}
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Leaderboard Card */}
          <div className={styles.waitlistContainer} style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem', color: 'white', textAlign: 'center' }}>
              Referral Leaderboard
            </h2>
            
            {leaderboard.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏆</div>
                <div style={{ fontSize: '1.5rem', color: 'white', marginBottom: '0.5rem' }}>No referrals yet</div>
                <div style={{ color: '#9ca3af' }}>Be the first to invite friends and claim the top spot!</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '700px', margin: '0 auto' }}>
                {leaderboard.map((entry, index) => (
                  <div
                    key={entry.address}
                    className={styles.riskCard}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1.5rem 2rem',
                      background: index < 3 
                        ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 140, 0, 0.1))'
                        : 'rgba(255, 255, 255, 0.05)',
                      border: index < 3 
                        ? '1px solid rgba(255, 215, 0, 0.3)'
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      transition: 'all 0.3s ease',
                      margin: '0 auto',
                      width: '100%'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <div
                        style={{
                          width: '3rem',
                          height: '3rem',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          fontSize: '1.1rem',
                          background: index === 0 ? '#ffd700' : 
                                     index === 1 ? '#c0c0c0' : 
                                     index === 2 ? '#cd7f32' : '#6b7280',
                          color: index < 3 ? '#000' : '#fff'
                        }}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <div style={{ color: 'white', fontWeight: '600', fontSize: '1.1rem' }}>
                          {fmtAddr(entry.address)}
                        </div>
                        {connected && publicKey?.toBase58() === entry.address && (
                          <div style={{ color: '#a78bfa', fontSize: '0.9rem', fontWeight: '500' }}>
                            That's you! 🎉
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white' }}>
                        {entry.count}
                      </div>
                      <div style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Referrals</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* How it works */}
          <div className={styles.waitlistContainer} style={{ maxWidth: '900px', marginTop: '3rem', margin: '3rem auto 0 auto' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem', color: 'white', textAlign: 'center' }}>
              How It Works
            </h2>
            <div className={styles.riskGrid} style={{ justifyItems: 'center' }}>
              <div className={styles.riskCard}>
                <div className={styles.riskIconWrapper}>
                  <span style={{ fontSize: '2rem' }}>🔗</span>
                </div>
                <div className={styles.riskCardTitle}>Share Your Link</div>
                <div className={styles.riskCardDescription}>
                  Copy your unique referral link and share it with friends
                </div>
              </div>
              <div className={styles.riskCard}>
                <div className={styles.riskIconWrapper}>
                  <span style={{ fontSize: '2rem' }}>👥</span>
                </div>
                <div className={styles.riskCardTitle}>Friends Join</div>
                <div className={styles.riskCardDescription}>
                  Friends visit through your link and connect their wallet
                </div>
              </div>
              <div className={styles.riskCard}>
                <div className={styles.riskIconWrapper}>
                  <span style={{ fontSize: '2rem' }}>🏆</span>
                </div>
                <div className={styles.riskCardTitle}>Climb the Ranks</div>
                <div className={styles.riskCardDescription}>
                  The more successful referrals, the higher your ranking
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}