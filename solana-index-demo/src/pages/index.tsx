import { createClient } from '@supabase/supabase-js';
import type { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { useCallback, useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import Particles from 'react-tsparticles';
import type { Engine } from 'tsparticles-engine';
import { loadSlim } from 'tsparticles-slim';
import { FaTwitter, FaTelegramPlane } from 'react-icons/fa';
import styles from '../styles/Home.module.css';
import { particlesOptions } from '../utils/particles';

// --- 型定義 ---
type AssetPrice = {
  symbol: string;
  price: number;
};

type IndexData = {
  created_at: string;
  index_value: number;
};

type Props = {
  initialIndexHistory: IndexData[];
  initialConstituentPrices: AssetPrice[];
  initialDailyChange: number | null;
  error?: string;
};

// --- UIコンポーネント ---
const Home: NextPage<Props> = ({ 
  initialIndexHistory, 
  initialConstituentPrices, 
  initialDailyChange, 
  error 
}) => {
  // --- State管理 ---
  // サーバーから受け取った初期データをstateで管理し、UIの更新に対応
  const [indexHistory, setIndexHistory] = useState(initialIndexHistory);
  const [constituentPrices, setConstituentPrices] = useState(initialConstituentPrices);
  const [dailyChange, setDailyChange] = useState(initialDailyChange);
  const [pageError, setPageError] = useState(error);

  // --- クライアントサイドでのデータ定期取得 ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/get-latest-data');
        if (!response.ok) {
          console.error("Failed to fetch latest data");
          return;
        }
        const data = await response.json();
        if (data.error) {
          console.error("API Error:", data.error);
          return;
        }
        
        // stateを更新してUIを再描画
        setIndexHistory(data.indexHistory);
        setConstituentPrices(data.constituentPrices);
        setDailyChange(data.dailyChange);
        setPageError(undefined); // エラーが解消されたらエラーメッセージを消す

      } catch (err) {
        console.error("An error occurred while fetching data:", err);
      }
    };

    // 60秒（60000ミリ秒）ごとにデータを再取得
    const intervalId = setInterval(fetchData, 60000);

    // コンポーネントがアンマウントされた時にインターバルをクリア
    return () => clearInterval(intervalId);
  }, []); // 空の依存配列で、初回レンダリング時に一度だけ実行

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  if (pageError) {
    return (
      <div className={styles.container}>
        <main className={styles.main}>
          <h1 className={styles.title}>An Error Occurred</h1>
          <p className={styles.errorText}>{pageError}</p>
        </main>
      </div>
    );
  }

  // --- 表示用データの準備 ---
  const latestIndexData = indexHistory[indexHistory.length - 1];
  const latestIndexValue = latestIndexData ? latestIndexData.index_value.toFixed(2) : 'N/A';

  const chartData = indexHistory.map(item => ({
    full_date: new Date(item.created_at),
    value: item.index_value,
  }));
  
  const formatXAxis = (tickItem: Date) => {
    return tickItem.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const date = new Date(label);
      return (
        <div style={{ background: 'rgba(0,0,0,0.8)', padding: '10px', border: '1px solid #555', borderRadius: '8px' }}>
          <p style={{ margin: 0, color: '#fff' }}>{`Value: ${payload[0].value.toFixed(2)}`}</p>
          <p style={{ margin: 0, color: '#aaa', fontSize: '0.8rem' }}>{date.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Market Pulse Index</title>
        <meta name="description" content="An equally weighted index to capture the true sentiment of the crypto market." />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Lora:ital,wght@0,400..700;1,400..700&display=swap" rel="stylesheet" />
      </Head>
      
      <Particles id="tsparticles" init={particlesInit} options={particlesOptions} className={styles.particles} />

      <main className={styles.main}>
        <h1 className={styles.title}>
          <Image src="/logo.png" alt="Logo" width={180} height={60} />
        </h1>
        <p className={styles.description}>
          An equally weighted index designed to capture the true sentiment of the crypto market, moving beyond the bias of major assets.
        </p>
        
        <div className={styles.indexDisplay}>
          <p className={styles.indexLabel}>Current Index Value</p>
          <div className={styles.indexValueContainer}>
            <div className={styles.indexValue}>{latestIndexValue}</div>
            {dailyChange !== null && (
              <div className={dailyChange >= 0 ? styles.positiveChange : styles.negativeChange}>
                {dailyChange >= 0 ? '▲' : '▼'} {Math.abs(dailyChange).toFixed(2)}%
                <span> (24H)</span>
              </div>
            )}
          </div>
        </div>
        
        <div className={styles.constituentContainer}>
          <div className={styles.constituentHeader}>
            <h2 className={styles.constituentTitle}>Index Constituents</h2>
            <p className={styles.constituentDescription}>Each asset is equally weighted at 10% to ensure a balanced market representation.</p>
          </div>
          <div className={styles.constituentGrid}>
            {constituentPrices.map(asset => (
              <div key={asset.symbol} className={styles.assetCard}>
                <div className={styles.assetSymbol}>{asset.symbol}</div>
                <div className={styles.assetPrice}>${asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div className={styles.assetWeight}>10% Weight</div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.methodologyContainer}>
          <h2 className={styles.methodologyTitle}>Calculation Methodology</h2>
          <div className={styles.methodologyContent}>
            <p>The index value is calculated based on the price performance of its constituent assets since the base date.</p>
            <div className={styles.formulaBox}>
              <span className={styles.formulaText}>Index = 100 × &sum; ( P_current / P_base ) / N</span>
            </div>
            <div className={styles.formulaLegend}>
              <span><b>P_current</b>: Current price of an asset</span>
              <span><b>P_base</b>: Price of the asset on the base date</span>
              <span><b>N</b>: Number of constituent assets (currently 10)</span>
              <span><b>&sum;</b>: Summation across all assets</span>
            </div>
          </div>
        </div>

        <div className={styles.chartContainer}>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="full_date" tickFormatter={formatXAxis} stroke="#888" />
              <YAxis stroke="#888" domain={['dataMin - 5', 'auto']} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} dot={false} name="Index Value" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className={styles.aboutContainer}>
          <div className={styles.aboutPfp}>
            <Image src="/pfp.jpg" alt="Muse" width={120} height={120} style={{ borderRadius: '50%' }}/>
          </div>
          <div className={styles.aboutContent}>
            <h2>About Me</h2>
            <p className={styles.aboutIntro}>
              Thank you for visiting. My name is Muse, the creator of this project. 
              <br />
              I'm a SolanaSuperTeamJapan Contributor based in Tokyo, Japan.
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
        </div>
      </main>
    </div>
  );
};

// --- サーバーサイドでの初回データ取得 ---
export const getServerSideProps: GetServerSideProps = async () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const apiKey = process.env.CRYPTOCOMPARE_API_KEY;

  if (!supabaseUrl || !supabaseKey || !apiKey) {
    return { 
      props: { 
        initialIndexHistory: [],
        initialConstituentPrices: [],
        initialDailyChange: null,
        error: "Server environment variables are not configured correctly." 
      } 
    };
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const CONSTITUENT_SYMBOLS = ['BTC', 'ETH', 'XRP', 'BNB', 'SOL', 'DOGE', 'TRX', 'ADA', 'SUI', 'AVAX'];

    const now = new Date();
    const today_0_jst = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const yesterday_0_jst = new Date(today_0_jst);
    yesterday_0_jst.setDate(yesterday_0_jst.getDate() - 1);
    
    const { data: historyData, error: historyError } = await supabase
      .from('index_history')
      .select('created_at, index_value')
      .order('created_at', { ascending: true })
      .gte('created_at', yesterday_0_jst.toISOString());

    if (historyError) throw new Error(historyError.message);
    if (!historyData || historyData.length < 2) {
      return { 
        props: { 
          initialIndexHistory: historyData || [],
          initialConstituentPrices: [],
          initialDailyChange: null,
          error: "Not enough index data to compare. Please wait for more data." 
        }
      };
    }

    const latestData = historyData[historyData.length - 1];
    const previousDayData = historyData.filter(d => new Date(d.created_at) < today_0_jst).pop(); 

    let dailyChange: number | null = null;
    if (latestData && previousDayData) {
      const latestValue = latestData.index_value;
      const previousValue = previousDayData.index_value;
      if (previousValue > 0) {
        dailyChange = ((latestValue - previousValue) / previousValue) * 100;
      }
    }

    const priceResponse = await fetch(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${CONSTITUENT_SYMBOLS.join(',')}&tsyms=USD&api_key=${apiKey}`);
    if (!priceResponse.ok) throw new Error('Failed to fetch constituent prices.');
    const priceData = await priceResponse.json();

    const constituentPrices = CONSTITUENT_SYMBOLS.map(symbol => ({
      symbol,
      price: priceData[symbol]?.USD || 0,
    }));

    const limitedHistory = historyData.slice(-100);

    return {
      props: {
        initialIndexHistory: limitedHistory,
        initialConstituentPrices: constituentPrices,
        initialDailyChange: dailyChange,
      },
    };
  } catch (err: any) {
    return {
      props: {
        initialIndexHistory: [],
        initialConstituentPrices: [],
        initialDailyChange: null,
        error: err.message,
      },
    };
  }
};

export default Home;