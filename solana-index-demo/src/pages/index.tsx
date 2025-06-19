import { createClient } from '@supabase/supabase-js';
import type { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useState, useEffect, useRef } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceDot,
} from 'recharts';
import Particles from 'react-tsparticles';
import type { Engine } from 'tsparticles-engine';
import { loadSlim } from 'tsparticles-slim';
import { FaTwitter, FaTelegramPlane } from 'react-icons/fa';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import CountUp from 'react-countup';
import { motion, Variants } from 'framer-motion';
import styles from '../styles/Home.module.css';
import { particlesOptions } from '../utils/particles';
import { marketEvents } from '../lib/market-events';
import { getPerformanceMetrics, PerformanceData } from '../lib/performance';

// --- 型定義 ---
type BreakdownAsset = {
  symbol: string;
  basePrice: number;
  currentPrice: number;
  ratio: number;
  change24h: number | null;
};

type LatestEntry = {
  created_at: string;
  index_value: number;
  calculation_breakdown: {
    sumOfRatios: number;
    assets: BreakdownAsset[];
  };
};

type DailyData = {
  day: string;
  index_value: number;
};

type MarketEvent = {
  event_date: string;
  title: string;
  description: string;
};

// ★★★ 新しいPropsの型定義 ★★★
type Props = {
  performance: PerformanceData | null;
  latestEntry: LatestEntry | null;
  chartData: DailyData[];
  dailyChange: number | null;
  events: MarketEvent[];
  error?: string;
};

// スクロールアニメーションの定義
const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeInOut"
    }
  }
};

// --- UIコンポーネント ---
const Home: NextPage<Props> = ({ 
  performance,
  latestEntry: initialLatestEntry,
  chartData: initialChartData,
  dailyChange: initialDailyChange,
  events,
  error 
}) => {
  // ★★★ 新しいPropsに合わせてStateを更新 ★★★
  const [performanceData, setPerformanceData] = useState(performance);
  const [latestEntry, setLatestEntry] = useState(initialLatestEntry);
  const [chartData, setChartData] = useState(initialChartData);
  const [dailyChange, setDailyChange] = useState(initialDailyChange);
  const [pageError, setPageError] = useState(error);
  const [animationTrigger, setAnimationTrigger] = useState(0);

  const prevIndexValue = useRef(0);
  const prevDailyChange = useRef(0);

  useEffect(() => {
    prevIndexValue.current = performanceData ? performanceData.latestValue : 0;
    prevDailyChange.current = dailyChange || 0;
  }, [performanceData, dailyChange]);

  // ★★★ 将来的にはこのポーリングAPIもperformanceオブジェクトを返すように修正が必要です ★★★
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/get-latest-data', { cache: 'no-store' });
        if (!response.ok) { console.error("Failed to fetch latest data"); return; }
        const data = await response.json();
        if (data.error) { console.error("API Error:", data.error); return; }
        
        // 仮：現状のAPIに合わせて更新（将来的にはAPI側もperformanceを返すようにする）
        setLatestEntry(data.latestEntry);
        // chartDataやdailyChangeも同様に更新
        // setChartData(data.chartData);
        setDailyChange(data.dailyChange);
        // setPerformanceData(data.performance); // 本来はこうしたい
        setPageError(undefined);
        setAnimationTrigger(prev => prev + 1);
      } catch (err) {
        console.error("An error occurred while fetching data:", err);
      }
    };

    const intervalId = setInterval(fetchData, 60000);
    return () => clearInterval(intervalId);
  }, []);

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  if (pageError || !performanceData || !latestEntry || chartData.length === 0) {
    return (
      <div className={styles.container}>
        <main className={styles.main}>
          <h1 className={styles.title}>An Error Occurred</h1>
          <p className={styles.errorText}>{pageError || "No data available."}</p>
        </main>
      </div>
    );
  }

  const { calculation_breakdown: breakdown } = latestEntry;
  const { sumOfRatios, assets: constituentAssets } = breakdown || { sumOfRatios: 0, assets: [] };

  const rechartsData = chartData.map(item => ({
    date: new Date(item.day).getTime(),
    value: item.index_value,
  }));
  
  const formatDateTick = (timestamp: number) => new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const date = new Date(label);
      return (
        <div style={{ background: 'rgba(0,0,0,0.8)', padding: '10px', border: '1px solid #555', borderRadius: '8px' }}>
          <p style={{ margin: 0, color: '#fff' }}>{`Value: ${Number(payload[0].value).toFixed(2)}`}</p>
          <p style={{ margin: 0, color: '#aaa', fontSize: '0.8rem' }}>{date.toLocaleDateString('en-US', { dateStyle: 'medium' })}</p>
        </div>
      );
    }
    return null;
  };

  const formatLargeNumber = (num: number) => {
    if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Market Pulse Index</title>
        <meta name="description" content="An equally weighted index to capture the true sentiment of the crypto market." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Lora:ital,wght@0,400..700;1,400..700&display=swap" rel="stylesheet" />
      </Head>
      
      <Particles id="tsparticles" init={particlesInit} options={particlesOptions} className={styles.particles} />

      <main className={styles.main}>
        <motion.h1 className={styles.title} initial={{opacity: 0, y: -50}} animate={{opacity: 1, y: 0}} transition={{duration: 0.8}}>
          <Image src="/logo.png" alt="Logo" width={180} height={60} />
        </motion.h1>
        <motion.p className={styles.description} initial={{opacity: 0}} animate={{opacity: 1}} transition={{duration: 0.8, delay: 0.2}}>
          An equally weighted index designed to capture the true sentiment of the crypto market, moving beyond the bias of major assets.
        </motion.p>
        
        <motion.div className={styles.callToActionContainer} initial={{opacity: 0}} animate={{opacity: 1}} transition={{duration: 0.8, delay: 0.4}}>
          <a href="https://muse-7.gitbook.io/axiswhitepaper/" target="_blank" rel="noopener noreferrer" className={styles.primaryButton}>
            Read WhitePaper
          </a>
        </motion.div>
        
        {/* ★★★ S&P風の新しい指標表示エリア ★★★ */}
        <motion.div className={styles.indexDisplay} variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.8 }}>
          <div className={styles.spHeader}>
            <div>
              <h2 className={styles.spIndexName}>AXIS Equal Weighted Index</h2>
              <p className={styles.spAsOfDate}>As of {performanceData.latestDate}</p>
            </div>
          </div>
          <div className={styles.spValueContainer}>
            <div className={styles.spMainValue}>
              <CountUp key={`index-${animationTrigger}`} start={prevIndexValue.current} end={performanceData.latestValue} decimals={2} duration={3} separator="," /> USD
            </div>
            {dailyChange !== null && (
              <div className={`${styles.spChangeValue} ${dailyChange >= 0 ? styles.positiveChange : styles.negativeChange}`}>
                {dailyChange >= 0 ? '+' : ''}
                <CountUp key={`change-${animationTrigger}`} start={prevDailyChange.current} end={dailyChange} decimals={2} duration={3} />% (1 Day)
              </div>
            )}
          </div>
          <div className={styles.spPerformanceGrid}>
            <div className={styles.spPerformanceItem}>
              <span>YTD Return</span>
              <span className={performanceData.ytdReturn && performanceData.ytdReturn >= 0 ? styles.positiveChange : styles.negativeChange}>
                {performanceData.ytdReturn !== null ? `${performanceData.ytdReturn.toFixed(2)}%` : 'N/A'}
              </span>
            </div>
            <div className={styles.spPerformanceItem}>
              <span>1 YR Return</span>
              <span className={performanceData.oneYearReturn && performanceData.oneYearReturn >= 0 ? styles.positiveChange : styles.negativeChange}>
                {performanceData.oneYearReturn !== null ? `${performanceData.oneYearReturn.toFixed(2)}%` : 'N/A'}
              </span>
            </div>
          </div>
        </motion.div>
        
        <motion.div className={styles.constituentContainer} variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
          <div className={styles.constituentHeader}>
            <h2 className={styles.constituentTitle}>Index Constituents</h2>
            <p className={styles.constituentDescription}>Each asset is equally weighted at 10% to ensure a balanced market representation.</p>
            <p className={styles.constituentDisclaimer}>Note: This index updates hourly. The constituent assets are fixed during the beta period.</p>
          </div>
          <div className={styles.constituentGrid}>
            {constituentAssets.map(asset => (
              <div key={asset.symbol} className={styles.assetCard}>
                 <div className={styles.assetHeader}>
                  <span className={styles.assetSymbol}>{asset.symbol}</span>
                  <span className={styles.assetWeight}>10%</span>
                </div>
                <div className={styles.assetPrice}>
                  <CountUp key={`${asset.symbol}-price-${animationTrigger}`} start={0} end={asset.currentPrice} decimals={2} duration={2.5} separator="," prefix="$" />
                </div>
                <div className={styles.assetStats}>
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>24H Change</span>
                    <span className={`${styles.statValue} ${asset.change24h && asset.change24h >= 0 ? styles.positiveChangeSmall : styles.negativeChangeSmall}`}>
                      {asset.change24h !== null ? (
                        <>
                          {asset.change24h >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                          {Math.abs(asset.change24h).toFixed(2)}%
                        </>
                      ) : ('N/A')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
        
        <motion.div className={styles.chartContainer} variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={rechartsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" tickFormatter={formatDateTick} stroke="#888" type="number" scale="time" domain={['dataMin', 'dataMax']} />
              <YAxis stroke="#888" domain={['auto', 'auto']} />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36}/>
              <Line type="monotone" dataKey="value" stroke="#FFFFFF" strokeWidth={2} dot={false} name="Index Value" />
              {events.map(event => {
                  const eventDate = new Date(event.event_date);
                  const dataPoint = rechartsData.find(d => new Date(d.date).toDateString() === eventDate.toDateString());
                  if (!dataPoint) return null;

                  return ( <ReferenceDot key={event.title} x={dataPoint.date} y={dataPoint.value} r={6} fill="#00E5FF" stroke="#000" /> );
              })}
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
        
        <motion.div className={styles.timelineContainer} variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
          <h2 className={styles.timelineTitle}>Event Timeline</h2>
          <div className={styles.eventList}>
            {events.map(event => (
              <div key={event.title} className={styles.eventItem}>
                <div className={styles.eventDate}>{new Date(event.event_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                <div className={styles.eventDetails}>
                  <h3 className={styles.eventTitle}>{event.title}</h3>
                  <p className={styles.eventDescription}>{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div className={styles.methodologyContainer} variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.8 }}>
          <h2 className={styles.methodologyTitle}>Calculation Methodology</h2>
          <div className={styles.methodologyContent}>
             <div className={styles.formulaBox}>
              <span className={styles.formulaText}>
                {/* ★★★
                      This formula display is based on the OLD normalization logic.
                      It should be updated or removed depending on the new multi-index display logic.
                      For now, it might show confusing values.
                 ★★★ */}
                {Number(performanceData.latestValue).toFixed(2)} = 100 × ( {Number(sumOfRatios).toFixed(2)} / {constituentAssets.length} )
              </span>
            </div>
            <table className={styles.breakdownTable}>
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Current Price</th>
                  <th>Base Price (1y ago)</th>
                  <th>Ratio</th>
                </tr>
              </thead>
              <tbody>
                {constituentAssets.map(asset => (
                  <tr key={asset.symbol}>
                    <td className={styles.symbol}>{asset.symbol}</td>
                    <td>${asset.currentPrice.toFixed(2)}</td>
                    <td>${asset.basePrice.toFixed(2)}</td>
                    <td>{asset.ratio.toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div className={styles.aboutContainer} variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.8 }}>
          <div className={styles.aboutPfp}>
            <Image src="/pfp.jpg" alt="Muse" width={120} height={120} style={{ borderRadius: '50%' }}/>
          </div>
          <div className={styles.aboutContent}>
            <h2>About Me</h2>
            <p className={styles.aboutIntro}>
              Thank you for visiting. My name is Muse, the creator of this project. 
              <br />
              I'm a <a href="https://superteam.fun/jp" target="_blank" rel="noopener noreferrer">SolanaSuperTeamJapan</a> Contributor based in Tokyo, Japan.
            </p>
            <h3>Motivation</h3>
            <p>
              As both an engineer and a trader in DeFi, I've interacted with countless projects but found that no existing benchmark purely represents the true market sentiment. That's why I created this site. I am passionate about contributing to the Solana ecosystem and am currently developing this "Axis Project" in preparation for the next hackathon.
            </p>
            <h3>Call to Action</h3>
            <p>
              This is a beta test for an experiment to provide a DeFi index on Solana. I'm looking for people who resonate with my ambition or have knowledge in financial engineering. Let's invent a benchmark from our home, Solana, that makes trading safer and more intuitive for everyone.
            </p>
            <div className={styles.aboutSocials}>
              <a href="https://t.me/yus0509" target="_blank" rel="noopener noreferrer">
                <FaTelegramPlane />
                <span>@yus0509</span>
              </a>
              <a href="https://x.com/muse_0509" target="_blank" rel="noopener noreferrer">
                <FaTwitter />
                <span>@muse0509</span>
              </a>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};


// --- ★★★ サーバーサイドでの初回データ取得 (全面改訂) ★★★ ---
export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!, 
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // 1. 新しいパフォーマンス指標（最新値, 1年リターン, YTDリターン等）をまとめて取得
    const performance = await getPerformanceMetrics(supabase);

    // 2. 計算内訳など、最新エントリの詳細を取得
    const { data: latestEntry, error: latestEntryError } = await supabase
      .from('index_history')
      .select('created_at, calculation_breakdown')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    if (latestEntryError) throw latestEntryError;
    
    // 3. チャートに表示するための日次データを取得 (RPCを呼び出し)
    const { data: chartData, error: dailyHistoryError } = await supabase.rpc('get_daily_index_history');
    if (dailyHistoryError) throw dailyHistoryError;
    if (!chartData) throw new Error("Daily history data is null.");
    
    // 4. 24時間変動率を計算
    let dailyChange: number | null = null;
    if (chartData && chartData.length >= 2) {
      const latestValue = chartData[chartData.length - 1].index_value;
      const previousValue = chartData[chartData.length - 2].index_value;
      if (previousValue > 0) {
        dailyChange = ((latestValue - previousValue) / previousValue) * 100;
      }
    }

    return {
      props: {
        performance,
        latestEntry,
        chartData,
        dailyChange,
        events: marketEvents,
      },
    };
  } catch (err: any) {
    console.error("Error in getServerSideProps:", err.message);
    return {
      props: {
        performance: null,
        latestEntry: null,
        chartData: [],
        dailyChange: null,
        events: marketEvents,
        error: err.message || "Failed to fetch initial data.",
      },
    };
  }
};

export default Home;