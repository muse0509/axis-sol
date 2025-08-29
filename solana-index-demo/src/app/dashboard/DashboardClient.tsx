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

import { particlesOptions } from '../../utils/particles'
import type { EChartProps } from '../../components/charts/EChartsChart'
import BuyModal from '../../components/dashboard/BuyModal'

const WalletBar = dynamic(() => import('@/components/crypto/WalletBar'), { ssr: false })
const BurnModal = dynamic(() => import('@/components/dashboard/BurnModal'), { ssr: false })
const EChartsChart = dynamic<EChartProps>(
  () => import('../../components/charts/EChartsChart'),
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
      <div className="px-6 md:px-16 bg-black text-white min-h-screen overflow-x-hidden relative">
        <main className="min-h-screen py-8 md:py-16 flex flex-col items-center z-10 relative">
          <h1 className="m-0 leading-tight text-4xl md:text-6xl font-bold tracking-tighter flex items-center gap-4 md:gap-6">Error</h1>
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
      <div className="px-6 md:px-16 bg-black text-white min-h-screen overflow-x-hidden relative">
        <Particles id="tsparticles" init={particlesInit} options={particlesOptions} className="fixed inset-0 w-full h-full z-0 pointer-events-none" />

        <main className="min-h-screen py-8 md:py-16 flex flex-col items-center z-10 relative">
          <motion.h1 className="m-0 leading-tight text-4xl md:text-6xl font-bold tracking-tighter flex items-center gap-4 md:gap-6" initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <Image src="/logo.png" alt="Logo" width={250} height={200} priority />
          </motion.h1>

          <motion.p className="my-4 mb-8 leading-relaxed text-lg md:text-xl text-gray-400 text-center max-w-[600px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.2 }}>
            An equally weighted index designed to capture the true sentiment of the crypto market, moving beyond the bias of major assets.
          </motion.p>

          <WalletBar />

          <motion.div className="flex flex-col md:flex-row gap-4 mb-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.4 }}>
            <button onClick={() => setModalOpen(true)} className="inline-block px-7 py-3 rounded-lg text-base font-semibold no-underline transition-all duration-200 ease-in-out border border-transparent cursor-pointer bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:bg-gray-200 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(255,255,255,0.4)]">
              Buy Index Token
            </button>
            <button onClick={() => setBurnOpen(true)} className="inline-block px-7 py-3 rounded-lg text-base font-semibold no-underline transition-all duration-200 ease-in-out border border-transparent cursor-pointer bg-white/10 text-white border-white/20 hover:bg-white/20 hover:border-white/30">
              Burn Index Token
            </button>
            <a href="https://muse-7.gitbook.io/axiswhitepaper/" target="_blank" rel="noopener noreferrer" className="inline-block px-7 py-3 rounded-lg text-base font-semibold no-underline transition-all duration-200 ease-in-out border border-transparent cursor-pointer bg-white/10 text-white border-white/20 hover:bg-white/20 hover:border-white/30">
              Read WhitePaper
            </a>
            <a href="/challenge" target="_blank" rel="noopener noreferrer" className="inline-block px-7 py-3 rounded-lg text-base font-semibold no-underline transition-all duration-200 ease-in-out border border-transparent cursor-pointer bg-white/10 text-white border-white/20 hover:bg-white/20 hover:border-white/30">
              Create Challenge Image
            </a>
          </motion.div>

          <motion.div className="flex items-center gap-2 mb-12 text-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.6 }}>
            <p className="text-gray-400">Powered by&nbsp;</p>
            <Image src="/magicblock-logo.png" alt="MagicBlock" width={180} height={32} />
          </motion.div>

          <motion.div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 text-center backdrop-blur-md mb-12 w-full max-w-[500px]" variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.8 }}>
            <p className="m-0 mb-4 text-lg md:text-xl text-gray-400 font-medium">Current Index Value (Base: 100)</p>
            <div className="flex flex-col md:flex-row items-baseline justify-center gap-4 md:gap-6">
              <div className="text-4xl md:text-6xl font-bold leading-none bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent text-shadow-[0_0_25px_rgba(255,255,255,0.6)]">
                <CountUp end={displayedIdx} decimals={2} duration={0.2} separator="," />
              </div>
              {initialDailyChange !== null && (
                <div className={`text-2xl md:text-3xl font-semibold flex items-center gap-2 ${initialDailyChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {initialDailyChange >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                  <CountUp key="daily-change" end={initialDailyChange} decimals={2} duration={0.5} suffix="%" />
                  <span className="text-sm text-gray-400 font-normal ml-1">(24H)</span>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div className="w-full max-w-[1000px] mb-12" variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
            <div className="mb-6 text-center">
              <h2 className="text-2xl md:text-3xl font-semibold m-0">Index Constituents</h2>
              <p className="text-gray-400 max-w-[450px] mx-auto mt-2">Each asset is equally weighted at 10% to ensure a balanced market representation.</p>
              <p className="text-gray-500 text-sm max-w-[450px] mx-auto mt-4 italic">Prices are updated every five seconds via Pyth oracle feeds.</p>
            </div>

            {loading ? (
              <div className="text-center text-lg">Loading real-time prices…</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {assets.map(a => (
                  <div key={a.symbol} className="bg-white/5 border border-white/10 rounded-2xl p-3 md:p-4 transition-all duration-200 ease-in-out flex flex-col gap-3 md:gap-4 hover:-translate-y-1 hover:bg-white/15 hover:border-white/20">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl md:text-3xl font-semibold">{a.symbol}</span>
                      <span className="text-xs md:text-sm font-medium text-gray-400 bg-white/10 px-2 py-1 rounded-md">10%</span>
                    </div>
                    <div className="text-2xl md:text-3xl font-medium text-left">
                      <CountUp key={`${a.symbol}-price`} end={a.currentPrice} decimals={a.currentPrice < 1 ? 5 : 2} duration={0.5} separator="," prefix="$" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div className="w-full max-w-[1000px] bg-white/5 border border-white/10 rounded-2xl p-4 md:p-8 backdrop-blur-md mb-12" variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
            {echartsData && <EChartsChart data={echartsData} events={events} disableAnimation />}
          </motion.div>

          <motion.div className="w-full max-w-[1000px] mb-12" variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
            <h2 className="text-2xl md:text-3xl mb-6 border-l-4 border-white pl-4">Event Timeline</h2>
            <div className="flex flex-col gap-8">
              {events.map(ev => (
                <div key={ev.title} className="flex flex-col md:flex-row gap-3 md:gap-6 border-l-2 border-gray-500 pl-4 md:pl-6 relative">
                  <div className="absolute left-[-7px] top-[5px] w-3 h-3 bg-cyan-400 rounded-full border-2 border-black"></div>
                  <div className="font-semibold text-gray-400 min-w-[130px] pt-1">
                    {new Date(ev.event_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-lg md:text-xl font-semibold m-0 mb-2 text-white">{ev.title}</h3>
                    <p className="text-sm md:text-base text-gray-400 leading-relaxed m-0">{ev.description}</p>
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


