'use client';

/* =====================================================
 * app/dashboard/page.tsx ― Market Pulse Index ダッシュボード (App Router)
 * ===================================================== */

import Image from 'next/image'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Particles from 'react-tsparticles'
import type { Engine } from 'tsparticles-engine'
import { loadSlim } from 'tsparticles-slim'
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi'
import CountUp from 'react-countup'
import { motion, Variants } from 'framer-motion'
import styles from '../../styles/Dashboard.module.css'
import { particlesOptions } from '../../utils/particles'
import { marketEvents } from '../../lib/market-events'
import type { EChartProps } from '../../components/EChartsChart'
import BuyModal from '../../components/BuyModal'

import dynamic from 'next/dynamic'
const WalletBar = dynamic(() => import('@/components/WalletBar'), { ssr: false })
const BurnModal = dynamic(() => import('@/components/BurnModal'), { ssr: false })

/* ---------- Lazy‑load ECharts ---------- */
const EChartsChart = dynamic<EChartProps>(
  () => import('../../components/EChartsChart'),
  {
    ssr: false,
    loading: () => (
      <div style={{ height: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading chart…</p>
      </div>
    ),
  }
)

/* ---------- External API base ---------- */
const API_BASE = 'https://axis-trigger.kidneyweakx.workers.dev'

/* ---------- 型 ---------- */
type FeedPrice = { price: string; expo: number }
type PythFeed = { id: string; price: FeedPrice }

interface RealTimeAsset {
  symbol: string
  currentPrice: number
  change24h: number | null
}

interface CalculationBreakdown {
  sumOfRatios: number
  assets: { symbol: string; basePrice: number }[]
}

interface LatestEntry { created_at: string; index_value: number }
interface MarketEvent { event_date: string; title: string; description: string }
type EChartsData = (string | number)[][]

/* ---------- FAMC index API response ---------- */
interface FamcIndexResponse {
  indexPrice: number
  baseDate: string
  baseIndex: number
  currentIndex: number
  symbols: string[]
  count: number
}

/* ---------- Base‑day data ---------- */
const baseDayData: CalculationBreakdown = {
  sumOfRatios: 27.431066558841906,
  assets: [
    { symbol: 'BTC', basePrice: 42739.27 },
    { symbol: 'ETH', basePrice: 2528.09 },
    { symbol: 'XRP', basePrice: 0.568 },
    { symbol: 'BNB', basePrice: 309.09 },
    { symbol: 'SOL', basePrice: 102.07 },
    { symbol: 'DOGE', basePrice: 0.08053 },
    { symbol: 'TRX', basePrice: 0.1083 },
    { symbol: 'ADA', basePrice: 0.5278 },
    { symbol: 'SUI', basePrice: 1.292 },
    { symbol: 'AVAX', basePrice: 36.03 },
  ],
}

/* ---------- id → symbol map (小文字 key) ---------- */
const ID_TO_SYMBOL: Record<string, string> = {
  'e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43': 'BTC',
  'ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace': 'ETH',
  'ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d': 'SOL',
  'dcef206d2ab9a9acd1f68b8b4f6c5b5f6c5b5f6c5b5f6c5b5f6c5b5f6c5b5f6c': 'XRP',
  'dcef206d2ab9a9acd1f68b8b4f6c5b5f6c5b5f6c5b5f6c5b5f6c5b5f6c5b5f6d': 'BNB',
  'dcef206d2ab9a9acd1f68b8b4f6c5b5f6c5b5f6c5b5f6c5b5f6c5b5f6c5b5f6e': 'DOGE',
  'dcef206d2ab9a9acd1f68b8b4f6c5b5f6c5b5f6c5b5f6c5b5f6c5b5f6c5b5f6f': 'TRX',
  'dcef206d2ab9a9acd1f68b8b4f6c5b5f6c5b5f6c5b5f6c5b5f6c5b5f6c5b5f70': 'ADA',
  'dcef206d2ab9a9acd1f68b8b4f6c5b5f6c5b5f6c5b5f6c5b5f6c5b5f6c5b5f71': 'SUI',
  'dcef206d2ab9a9acd1f68b8b4f6c5b5f6c5b5f6c5b5f6c5b5f6c5b5f6c5b5f72': 'AVAX',
}

export default function DashboardPage() {
  const [latestEntry, setLatestEntry] = useState<LatestEntry | null>(null)
  const [echartsData, setEchartsData] = useState<EChartsData | null>(null)
  const [dailyChange, setDailyChange] = useState<number | null>(null)
  const [events] = useState<MarketEvent[]>(marketEvents)
  const [error, setError] = useState<string | null>(null)
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false)
  const [isBurnModalOpen, setIsBurnModalOpen] = useState(false)
  const [realTimeAssets, setRealTimeAssets] = useState<RealTimeAsset[]>([])

  // Fetch data on component mount
  useEffect(() => {
    fetchLatestData()
    fetchEchartsData()
    fetchRealTimePrices()
    
    // Set up interval for real-time updates
    const interval = setInterval(fetchRealTimePrices, 30000) // 30 seconds
    
    return () => clearInterval(interval)
  }, [])

  const fetchLatestData = async () => {
    try {
      const response = await fetch('/api/get-latest-data')
      if (response.ok) {
        const data = await response.json()
        setLatestEntry(data.latestEntry)
        setDailyChange(data.dailyChange)
      }
    } catch (err) {
      console.error('Error fetching latest data:', err)
      setError('Failed to fetch latest data')
    }
  }

  const fetchEchartsData = async () => {
    try {
      const response = await fetch('/api/get-latest-data')
      if (response.ok) {
        const data = await response.json()
        setEchartsData(data.echartsData)
      }
    } catch (err) {
      console.error('Error fetching chart data:', err)
    }
  }

  const fetchRealTimePrices = async () => {
    try {
      const response = await fetch(`${API_BASE}/pyth/feeds`)
      if (response.ok) {
        const data: PythFeed[] = await response.json()
        const assets = data
          .filter(feed => ID_TO_SYMBOL[feed.id])
          .map(feed => ({
            symbol: ID_TO_SYMBOL[feed.id],
            currentPrice: parseFloat(feed.price.price) * Math.pow(10, feed.price.expo),
            change24h: null // Would need additional API call for 24h change
          }))
        setRealTimeAssets(assets)
      }
    } catch (err) {
      console.error('Error fetching real-time prices:', err)
    }
  }

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine)
  }, [])

  const particlesLoaded = useCallback(async () => {
    // Particles loaded
  }, [])

  const openBuyModal = () => setIsBuyModalOpen(true)
  const closeBuyModal = () => setIsBuyModalOpen(false)
  const openBurnModal = () => setIsBurnModalOpen(true)
  const closeBurnModal = () => setIsBurnModalOpen(false)

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h1>Error</h1>
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <Particles
        id="tsparticles"
        init={particlesInit}
        loaded={particlesLoaded}
        options={particlesOptions}
      />
      
      <div className={styles.content}>
        <WalletBar />
        
        <div className={styles.header}>
          <h1>Market Pulse Index</h1>
          <p>Real-time tracking of the Axis Solana Index</p>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <h3>Current Index Value</h3>
            <div className={styles.statValue}>
              {latestEntry ? (
                <CountUp
                  end={latestEntry.index_value}
                  decimals={2}
                  duration={2}
                  separator=","
                />
              ) : (
                'Loading...'
              )}
            </div>
          </div>

          <div className={styles.statCard}>
            <h3>24h Change</h3>
            <div className={`${styles.statValue} ${dailyChange && dailyChange >= 0 ? styles.positive : styles.negative}`}>
              {dailyChange !== null ? (
                <>
                  {dailyChange >= 0 ? '+' : ''}
                  <CountUp
                    end={dailyChange}
                    decimals={2}
                    duration={2}
                    separator=","
                  />
                  %
                </>
              ) : (
                'Loading...'
              )}
            </div>
          </div>
        </div>

        <div className={styles.chartSection}>
          <h2>Index Performance</h2>
          {echartsData ? (
            <EChartsChart data={echartsData} events={events} />
          ) : (
            <div className={styles.loadingChart}>Loading chart...</div>
          )}
        </div>

        <div className={styles.actions}>
          <button onClick={openBuyModal} className={styles.actionButton}>
            Buy Index
          </button>
          <button onClick={openBurnModal} className={styles.actionButton}>
            Burn Tokens
          </button>
        </div>

        <div className={styles.eventsSection}>
          <h2>Market Events</h2>
          <div className={styles.eventsGrid}>
            {events.map((event, index) => (
              <div key={index} className={styles.eventCard}>
                <h3>{event.title}</h3>
                <p>{event.description}</p>
                <span className={styles.eventDate}>{event.event_date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BuyModal isOpen={isBuyModalOpen} onClose={closeBuyModal} indexPrice={latestEntry?.index_value || null} />
      <BurnModal isOpen={isBurnModalOpen} onClose={closeBurnModal} indexPrice={latestEntry?.index_value || null} />
    </div>
  )
}
