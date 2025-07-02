import type { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { useCallback, useState, useEffect } from 'react';
import Particles from 'react-tsparticles';
import type { Engine } from 'tsparticles-engine';
import { loadSlim } from 'tsparticles-slim';
import { FaTwitter, FaTelegramPlane } from 'react-icons/fa';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import CountUp from 'react-countup';
import { motion, Variants } from 'framer-motion';
import styles from '../styles/Dashboard.module.css';
import { particlesOptions } from '../utils/particles';
import { marketEvents } from '../lib/market-events';
import { promises as fs } from 'fs';
import path from 'path';
import dynamic from 'next/dynamic';
import BuyModal from '../components/BuyModal';

const EChartsChart = dynamic(
  () => import('../components/EChartsChart'),
  {
    ssr: false,
    loading: () => <div style={{ height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p>Loading chart...</p></div>
  }
);

// --- 型定義 ---
type BreakdownAsset = {
  symbol: string;
  basePrice: number;
  currentPrice: number;
  ratio: number;
  change24h: number | null;
};

type CalculationBreakdown = {
  sumOfRatios: number;
  assets: BreakdownAsset[];
};

type LatestEntry = {
  created_at: string;
  index_value: number;
  calculation_breakdown: CalculationBreakdown | null;
};

type MarketEvent = {
  event_date: string;
  title: string;
  description: string;
};

type EChartsData = (string | number)[][];

type Props = {
  initialLatestEntry: LatestEntry | null;
  echartsData: EChartsData | null;
  initialDailyChange: number | null;
  events: MarketEvent[];
  error?: string;
};

// ★★★ 基準日のデータをハードコーディング ★★★
const baseDayData: CalculationBreakdown = {
  "assets": [
    { "ratio": 2.339287264382382, "symbol": "BTC", "basePrice": 42739.27, "change24h": null, "currentPrice": 99979.43 },
    { "ratio": 1.3083078529640952, "symbol": "ETH", "basePrice": 2528.09, "change24h": null, "currentPrice": 3307.52 },
    { "ratio": 5.709507042253521, "symbol": "XRP", "basePrice": 0.568, "change24h": null, "currentPrice": 3.243 },
    { "ratio": 2.2907567375198163, "symbol": "BNB", "basePrice": 309.09, "change24h": null, "currentPrice": 708.05 },
    { "ratio": 2.068090526109533, "symbol": "SOL", "basePrice": 102.07, "change24h": null, "currentPrice": 211.09 },
    { "ratio": 4.675276294548615, "symbol": "DOGE", "basePrice": 0.08053, "change24h": null, "currentPrice": 0.3765 },
    { "ratio": 2.1892890120036936, "symbol": "TRX", "basePrice": 0.1083, "change24h": null, "currentPrice": 0.2371 },
    { "ratio": 2.0632815460401663, "symbol": "ADA", "basePrice": 0.5278, "change24h": null, "currentPrice": 1.089 },
    { "ratio": 3.675696594427244, "symbol": "SUI", "basePrice": 1.292, "change24h": null, "currentPrice": 4.749 },
    { "ratio": 1.1115736885928391, "symbol": "AVAX", "basePrice": 36.03, "change24h": null, "currentPrice": 40.05 }
  ],
  "sumOfRatios": 27.431066558841906
};


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

const Home: NextPage<Props> = ({
  initialLatestEntry,
  initialDailyChange,
  events,
  echartsData,
  error
}) => {
  const pageError = error;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);
  useEffect(() => {
    // ページがマウントされた時に、ウィンドウを(0, 0)の位置にスクロール
    window.scrollTo(0, 0);
  }, []); 

  if (pageError || !initialLatestEntry || !echartsData || echartsData.length === 0) {
    return (
      <div className={styles.container}>
        <main className={styles.main}>
          <h1 className={styles.title}>An Error Occurred</h1>
          <p className={styles.errorText}>{pageError || "No data available."}</p>
        </main>
      </div>
    );
  }

  const latestClose = echartsData[echartsData.length - 1][2] as number;
  const baseOpen = echartsData[0][1] as number;
  const latestNormalizedValue = baseOpen > 0 ? (latestClose / baseOpen) * 100 : 0;

  const { assets: latestConstituentAssets } = initialLatestEntry.calculation_breakdown || { assets: [] };

  return (
    <>
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
          <motion.h1 className={styles.title} initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <Image src="/logo.png" alt="Logo" width={180} height={60} />
          </motion.h1>
          <motion.p className={styles.description} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.2 }}>
            An equally weighted index designed to capture the true sentiment of the crypto market, moving beyond the bias of major assets.
          </motion.p>

          <motion.div className={styles.callToActionContainer} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.4 }}>
            <button onClick={() => setIsModalOpen(true)} className={styles.primaryButton}>
              Buy Index Token
            </button>
            <a href="https://muse-7.gitbook.io/axiswhitepaper/" target="_blank" rel="noopener noreferrer" className={styles.secondaryButton}>
              Read WhitePaper
            </a>
          </motion.div>

          <motion.div className={styles.indexDisplay} variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.8 }}>
            <p className={styles.indexLabel}>Current Index Value (Base: First day = 100)</p>
            <div className={styles.indexValueContainer}>
              <div className={styles.indexValue}>
                <CountUp key="index-value" end={latestNormalizedValue} decimals={2} duration={0.5} separator="," />
              </div>
              {initialDailyChange !== null && (
                <div className={`${styles.changeContainer} ${initialDailyChange >= 0 ? styles.positiveChange : styles.negativeChange}`}>
                  {initialDailyChange >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                  <CountUp key="daily-change" end={initialDailyChange} decimals={2} duration={0.5} suffix="%" />
                  <span>(24H)</span>
                </div>
              )}
            </div>
          </motion.div>

          {latestConstituentAssets && latestConstituentAssets.length > 0 ? (
            <motion.div className={styles.constituentContainer} variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
              <div className={styles.constituentHeader}>
                <h2 className={styles.constituentTitle}>Index Constituents</h2>
                <p className={styles.constituentDescription}>Each asset is equally weighted at 10% to ensure a balanced market representation.</p>
                <p className={styles.constituentDisclaimer}>Note: This index updates hourly. The constituent assets are fixed during the beta period.</p>
              </div>
              <div className={styles.constituentGrid}>
                {latestConstituentAssets.map(asset => (
                  <div key={asset.symbol} className={styles.assetCard}>
                    <div className={styles.assetHeader}>
                      <span className={styles.assetSymbol}>{asset.symbol}</span>
                      <span className={styles.assetWeight}>10%</span>
                    </div>
                    <div className={styles.assetPrice}>
                      <CountUp key={`${asset.symbol}-price`} end={asset.currentPrice} decimals={asset.currentPrice < 1 ? 5 : 2} duration={0.5} separator="," prefix="$" />
                    </div>
                    <div className={styles.assetStats}>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>24H Change</span>
                        <span className={`${styles.statValue} ${asset.change24h !== null && asset.change24h >= 0 ? styles.positiveChangeSmall : styles.negativeChangeSmall}`}>
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
          ) : null }

          <motion.div className={styles.chartContainer} variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
            {echartsData && <EChartsChart data={echartsData} events={events} />}
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
            <h2 className={styles.methodologyTitle}>Calculation Methodology (Base Day: Index = 100)</h2>
            <div className={styles.methodologyContent}>
              <div className={styles.formulaBox}>
                <span className={styles.formulaText}>
                  100.00 = 100 × ( {baseDayData.sumOfRatios.toFixed(2)} / {baseDayData.assets.length} )
                </span>
              </div>
              <p className={styles.constituentDescription} style={{textAlign: 'center', marginTop: '2rem'}}>
                The index calculation started with these constituent prices on the base day.
              </p>
              <div className={styles.constituentGrid} style={{marginTop: '1rem'}}>
                {baseDayData.assets.map(asset => (
                  <div key={asset.symbol} className={styles.assetCard}>
                    <div className={styles.assetHeader}>
                      <span className={styles.assetSymbol}>{asset.symbol}</span>
                    </div>
                    <div className={styles.assetPrice} style={{color: '#EAF0F7'}}>
                      <CountUp
                        end={asset.currentPrice}
                        decimals={asset.currentPrice < 1 ? 5 : 2}
                        duration={0.5}
                        separator=","
                        prefix="$"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </main>
      </div>
      <BuyModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        indexPrice={latestClose}
      />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const csvFilePath = path.join(process.cwd(), 'data.csv');
    const fileContent = await fs.readFile(csvFilePath, 'utf8');

    const rows = fileContent.trim().split('\n');
    const header = rows[0].split(',').map(h => h.trim()); 
    const data = rows.slice(1).map(row => {
      const values = row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
      const entry: any = {};
      header.forEach((key, index) => {
        const value = values[index] || '';
        if (key === 'index_value') {
          entry[key] = parseFloat(value);
        } else if (key === 'calculation_breakdown') {
          try {
            let jsonString = value;
            if (jsonString.startsWith('"') && jsonString.endsWith('"')) {
              jsonString = jsonString.substring(1, jsonString.length - 1);
            }
            jsonString = jsonString.replace(/""/g, '"');
            entry[key] = JSON.parse(jsonString);
          } catch {
            entry[key] = null;
          }
        } else {
          entry[key] = value;
        }
      });
      return entry;
    });

    data.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    if (data.length === 0) {
      throw new Error("CSV file is empty or invalid.");
    }

    const latestEntry = data[data.length - 1];

    const dailyOhlcMap = new Map<string, { open: number, high: number, low: number, close: number }>();
    data.forEach(entry => {
      if(!entry.created_at || !entry.index_value) return; // 不正な行をスキップ
      const day = new Date(entry.created_at).toISOString().split('T')[0];
      const price = entry.index_value;
      if (!dailyOhlcMap.has(day)) {
        dailyOhlcMap.set(day, { open: price, high: price, low: price, close: price });
      } else {
        const current = dailyOhlcMap.get(day)!;
        current.high = Math.max(current.high, price);
        current.low = Math.min(current.low, price);
        current.close = price;
      }
    });

    const echartsData = Array.from(dailyOhlcMap.entries())
      .map(([day, ohlc]) => ([
        day, ohlc.open, ohlc.close, ohlc.low, ohlc.high,
      ]))
      .sort((a, b) => new Date(a[0] as string).getTime() - new Date(b[0] as string).getTime());

    let dailyChange: number | null = null;
    if (echartsData.length >= 2) {
      const latestClose = echartsData[echartsData.length - 1][2] as number;
      const previousClose = echartsData[echartsData.length - 2][2] as number;
      if (isFinite(latestClose) && isFinite(previousClose) && previousClose > 0) {
        dailyChange = ((latestClose - previousClose) / previousClose) * 100;
      }
    }
    
    // undefinedをnullに変換するサニタイズ処理
    const sanitize = (obj: any) => obj ? JSON.parse(JSON.stringify(obj)) : null;

    return {
      props: {
        initialLatestEntry: sanitize(latestEntry),
        echartsData: echartsData,
        initialDailyChange: dailyChange,
        events: marketEvents,
        // ★★★ 基準日の計算内訳はハードコードするため、propsから削除 ★★★
      },
    };

  } catch (err: any) {
    console.error("Error in getServerSideProps (CSV):", err);
    return {
      props: {
        initialLatestEntry: null,
        echartsData: null,
        initialDailyChange: null,
        events: marketEvents,
        error: err.message || "Failed to fetch initial data from CSV.",
      },
    };
  }
};

export default Home;