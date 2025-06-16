import { createClient } from '@supabase/supabase-js';
import type { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceDot, // イベントの点を打つためのコンポーネント
} from 'recharts';
import { motion } from 'framer-motion';
import styles from '../styles/Analysis.module.css'; // このページ専用のCSS
import { marketEvents } from '../lib/market-events'; // イベントデータをインポート

// --- 型定義 ---
type DailyData = {
  day: string;
  index_value: number;
};

type MarketEvent = {
  event_date: string;
  title: string;
  description: string;
};

type Props = {
  dailyHistory: DailyData[];
  events: MarketEvent[];
  error?: string;
};

// --- UIコンポーネント ---
const AnalysisPage: NextPage<Props> = ({ dailyHistory, events, error }) => {
  
  if (error) {
    return (
      <div className={styles.container}>
        <main className={styles.main}>
          <h1 className={styles.title}>An Error Occurred</h1>
          <p className={styles.errorText}>{error}</p>
        </main>
      </div>
    );
  }

  // Rechartsが正しくソートするために、日付文字列をタイムスタンプ（数値）に変換
  const chartData = dailyHistory.map(item => ({
    date: new Date(item.day).getTime(),
    value: item.index_value,
  }));

  // チャートのX軸の日付フォーマットを定義
  const formatDateTick = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  return (
    <div className={styles.container}>
      <Head>
        <title>Historical Analysis - Market Pulse Index</title>
        <meta name="description" content="A historical analysis of the Market Pulse Index with major market events." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      
      <main className={styles.main}>
        <motion.div initial={{opacity: 0, y: -20}} animate={{opacity: 1, y: 0}} transition={{duration: 0.8}}>
          <Link href="/" className={styles.backLink}>← Back to Dashboard</Link>
          <h1 className={styles.title}>Historical Analysis</h1>
          <p className={styles.description}>
            A look at the index's performance correlated with significant market events over the past several months.
          </p>
        </motion.div>

        <motion.div 
          className={styles.chartContainer} 
          initial={{opacity: 0, y: 50}} 
          animate={{opacity: 1, y: 0}} 
          transition={{duration: 0.8, delay: 0.2}}
        >
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDateTick} 
                stroke="#888"
                type="number"
                scale="time"
                domain={['dataMin', 'dataMax']}
              />
              <YAxis stroke="#888" domain={['dataMin - 10', 'dataMax + 10']} />
              <Tooltip 
                labelFormatter={(label) => new Date(label).toLocaleDateString('en-US')}
                formatter={(value: number) => [value.toFixed(2), 'Index Value']}
                contentStyle={{ 
                  background: 'rgba(0,0,0,0.8)', 
                  borderColor: '#555',
                  borderRadius: '8px'
                }}
              />
              <Legend verticalAlign="top" height={36}/>
              <Line type="monotone" dataKey="value" stroke="#FFFFFF" strokeWidth={2} dot={false} name="Index Value" />
              
              {/* イベントデータをチャート上に点でプロット */}
              {events.map(event => (
                <ReferenceDot 
                  key={event.title}
                  x={new Date(event.event_date).getTime()}
                  y={chartData.find(d => 
                    new Date(d.date).toDateString() === new Date(event.event_date).toDateString()
                  )?.value}
                  r={6}
                  fill="#FFD700"
                  stroke="#333"
                  isFront={true}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
        
        <motion.div 
          className={styles.timelineContainer}
          initial={{opacity: 0, y: 50}} 
          animate={{opacity: 1, y: 0}} 
          transition={{duration: 0.8, delay: 0.4}}
        >
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
      </main>
    </div>
  );
};

// --- サーバーサイドでのデータ取得 ---
export const getServerSideProps: GetServerSideProps = async () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // 以前作成したDB関数を呼び出して、日足データを取得
    const { data: dailyHistory, error } = await supabase.rpc('get_daily_index_history');

    if (error) throw error;

    return {
      props: {
        dailyHistory: dailyHistory || [],
        events: marketEvents, // libファイルからインポートしたイベントデータ
      },
    };
  } catch (err: any) {
    return {
      props: {
        dailyHistory: [],
        events: [],
        error: err.message || "Failed to fetch historical data.",
      },
    };
  }
};

export default AnalysisPage;