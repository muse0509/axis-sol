'use client';

/* =====================================================
 * DashboardClient ― Client-side UI for Market Pulse Index
 * ===================================================== */

import Image from 'next/image'
import dynamic from 'next/dynamic'
import { useCallback, useEffect, useState } from 'react'
import Particles from 'react-tsparticles'
import type { Engine } from 'tsparticles-engine'
import { loadSlim } from 'tsparticles-slim'
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi'
import CountUp from 'react-countup'
import { motion, Variants } from 'framer-motion'

import styles from '../../styles/Dashboard.module.css'
import { particlesOptions } from '../../utils/particles'
import type { EChartProps } from '../../components/EChartsChart'
import BuyModal from '../../components/BuyModal'

const WalletBar = dynamic(() => import('@/components/WalletBar'), { ssr: false })
const BurnModal = dynamic(() => import('@/components/BurnModal'), { ssr: false })
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

const API_BASE = 'https://axis-trigger.kidneyweakx.workers.dev'

type EChartsData = (string | number)[][]

interface LatestEntry  { created_at: string; index_value: number }
interface MarketEvent  { event_date: string; title: string; description: string }

interface RealTimeAsset {
  symbol: string
  currentPrice: number
  change24h: number | null
}

interface CalculationBreakdown {
  sumOfRatios: number
  assets: { symbol: string; basePrice: number }[]
}

const ID_TO_SYMBOL: Record<string, string> = {
  'e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43': 'BTC',
  'ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace': 'ETH',
  'ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d': 'SOL',
  '2f95862b045670cd22bee3114c39763a4a08beeb663b145d283c31d7d1101c4f': 'BNB',
  'ec5d399846a9209f3fe5881d70aae9268c94339ff9817e8d18ff19fa05eea1c8': 'XRP',
  'dcef50dd0a4cd2dcc17e45df1676dcb336a11a61c69df7a0299b0150c672d25c': 'DOGE',
  '2a01deaec9e51a579277b34b122399984d0bbf57e2458a7e42fecd2829867a0d': 'ADA',
  '93da3352f9f1d105fdfe4971cfa80e9dd777bfc5d0f683ebb6e1294b92137bb7': 'AVAX',
  '67aed5a24fdad045475e7195c98a98aea119c763f272d4523f5bac93a4f33c2b': 'TRX',
  '23d7315113f5b1d3ba7a83604c44b94d79f4fd69af77f804fc7f920a6dc65744': 'SUI',
} as const

const sectionVariants: Variants = {
  hidden:  { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeInOut' } },
}

interface DashboardClientProps {
  initialLatestEntry: LatestEntry | null
  echartsData:         EChartsData | null
  initialDailyChange:  number | null
  events:              MarketEvent[]
  error?:              string
}

const DashboardClient = ({ initialLatestEntry, initialDailyChange, events, echartsData, error }: DashboardClientProps) => {
  const [assets,      setAssets]      = useState<RealTimeAsset[]>([])
  const [loading,     setLoading]     = useState(true)
  const [modalOpen,   setModalOpen]   = useState(false)
  const [burnOpen,    setBurnOpen]    = useState(false)
  const [currentIdx,  setCurrentIdx]  = useState<number | null>(null)

  const particlesInit = useCallback(async (engine: Engine) => { await loadSlim(engine) }, [])

  useEffect(() => {
    const es = new EventSource('/api/price-stream')
    es.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data)
        if (msg.type !== 'prices') return
        const latest: Record<string, number> = {}
        ;(msg.payload as any[]).forEach(({ id, price }) => {
          const canon = String(id).toLowerCase().replace(/^0x/, '')
          const expo  = (price as any).expo ?? (price as any).exponent ?? 0
          const p = Number((price as any).price)
          latest[canon] = p * Math.pow(10, expo)
        })
        const mapped: RealTimeAsset[] = Object.entries(ID_TO_SYMBOL).map(([id, sym]) => ({
          symbol: sym,
          currentPrice: latest[id] ?? 0,
          change24h: null,
        }))
        setAssets(prev => {
          const same = prev.length === mapped.length && prev.every((p, i) =>
            p.symbol === mapped[i].symbol && p.currentPrice === mapped[i].currentPrice
          )
          return same ? prev : mapped
        })
        setLoading(false)
      } catch {}
    }
    es.onerror = () => { /* rely on auto-reconnect */ }
    return () => es.close()
  }, [])

  useEffect(() => {
    let cancelled = false
    const fetchIndex = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/famcindexprice`)
        if (!res.ok) return
        const data: { indexPrice: number } = await res.json()
        if (!cancelled && typeof data.indexPrice === 'number') {
          setCurrentIdx(data.indexPrice)
        }
      } catch {}
    }
    fetchIndex()
    const id = setInterval(fetchIndex, 5000)
    return () => { cancelled = true; clearInterval(id) }
  }, [])

  if (error || !initialLatestEntry || !echartsData?.length) {
    return (
      <div className={styles.container}>
        <main className={styles.main}>
          <h1 className={styles.title}>Error</h1>
          <p>{error || 'No data available.'}</p>
        </main>
      </div>
    )
  }

  const latestClose   = echartsData.at(-1)![2] as number
  const baseOpen      = echartsData[0][1]     as number
  const fallbackIdx   = baseOpen ? (latestClose / baseOpen) * 100 : 0
  const displayedIdx  = currentIdx ?? fallbackIdx

  return (
    <>
      <div className={styles.container}>
        <Particles id="tsparticles" init={particlesInit} options={particlesOptions} className={styles.particles} />

        <main className={styles.main}>
          <motion.h1 className={styles.title} initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <Image src="/logo.png" alt="Logo" width={250} height={200} priority />
          </motion.h1>

          <motion.p className={styles.description} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.2 }}>
            An equally weighted index designed to capture the true sentiment of the crypto market, moving beyond the bias of major assets.
          </motion.p>

          <WalletBar />

          <motion.div className={styles.callToActionContainer} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.4 }}>
            <button onClick={() => setModalOpen(true)} className={styles.primaryButton}>
              Buy Index Token
            </button>
            <button onClick={() => setBurnOpen(true)} className={styles.secondaryButton}>
              Burn Index Token
            </button>
            <a href="https://muse-7.gitbook.io/axiswhitepaper/" target="_blank" rel="noopener noreferrer" className={styles.secondaryButton}>
              Read WhitePaper
            </a>
            <a href="/challenge" target="_blank" rel="noopener noreferrer" className={styles.secondaryButton}>
              Create Challenge Image
            </a>
          </motion.div>

          <motion.div className={styles.techStack} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.6 }}>
            <p className={styles.poweredBy}>Powered by&nbsp;</p>
            <Image src="/magicblock-logo.png" alt="MagicBlock" width={180} height={32} />
          </motion.div>

          <motion.div className={styles.indexDisplay} variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.8 }}>
            <p className={styles.indexLabel}>Current Index Value (Base: 100)</p>
            <div className={styles.indexValueContainer}>
              <div className={styles.indexValue}>
                <CountUp end={displayedIdx} decimals={2} duration={0.2} separator="," />
              </div>
              {initialDailyChange !== null && (
                <div className={`${styles.changeContainer} ${initialDailyChange >= 0 ? styles.positiveChange : styles.negativeChange}` }>
                  {initialDailyChange >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                  <CountUp key="daily-change" end={initialDailyChange} decimals={2} duration={0.5} suffix="%" />
                  <span>(24H)</span>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div className={styles.constituentContainer} variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
            <div className={styles.constituentHeader}>
              <h2 className={styles.constituentTitle}>Index Constituents</h2>
              <p className={styles.constituentDescription}>Each asset is equally weighted at 10% to ensure a balanced market representation.</p>
              <p className={styles.constituentDisclaimer}>Prices are updated every five seconds via Pyth oracle feeds.</p>
            </div>

            {loading ? (
              <div className={styles.loadingText}>Loading real-time prices…</div>
            ) : (
              <div className={styles.constituentGrid}>
                {assets.map(a => (
                  <div key={a.symbol} className={styles.assetCard}>
                    <div className={styles.assetHeader}>
                      <span className={styles.assetSymbol}>{a.symbol}</span>
                      <span className={styles.assetWeight}>10%</span>
                    </div>
                    <div className={styles.assetPrice}>
                      <CountUp key={`${a.symbol}-price`} end={a.currentPrice} decimals={a.currentPrice < 1 ? 5 : 2} duration={0.5} separator="," prefix="$" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div className={styles.chartContainer} variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
            {echartsData && <EChartsChart data={echartsData} events={events} disableAnimation />}
          </motion.div>

          <motion.div className={styles.timelineContainer} variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
            <h2 className={styles.timelineTitle}>Event Timeline</h2>
            <div className={styles.eventList}>
              {events.map(ev => (
                <div key={ev.title} className={styles.eventItem}>
                  <div className={styles.eventDate}>{new Date(ev.event_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                  <div className={styles.eventDetails}>
                    <h3 className={styles.eventTitle}>{ev.title}</h3>
                    <p className={styles.eventDescription}>{ev.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </main>
      </div>

      <BuyModal isOpen={modalOpen} onClose={() => setModalOpen(false)} indexPrice={currentIdx ?? latestClose} />
      <BurnModal
        isOpen={burnOpen}
        onClose={() => setBurnOpen(false)}
        indexPrice={currentIdx ?? latestClose}
      />
    </>
  )
}

export default DashboardClient


