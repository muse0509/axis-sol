'use client';

import { useCallback, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Particles from 'react-tsparticles'
import type { Engine } from 'tsparticles-engine'
import { loadSlim } from 'tsparticles-slim'

import { particlesOptions } from '../../utils/particles'
import Header from '../../components/dashboard/Header'
import WalletBar from '../../components/crypto/WalletBar'

const PortfolioChart = dynamic(() => import('../../components/portfolio/PortfolioChart'), { ssr: false })
const PortfolioStats = dynamic(() => import('../../components/portfolio/PortfolioStats'), { ssr: false })
const TokenAllocation = dynamic(() => import('../../components/portfolio/TokenAllocation'), { ssr: false })

interface TokenData {
  symbol: string
  name: string
  allocation: number
  currentPrice: number
  mintPrice: number
  marketCap: number
  volume24h: number
  change24h: number
  changeSinceMint: number
  icon: string
}

interface PortfolioData {
  totalValue: number
  totalChange: number
  tokens: TokenData[]
  mintDate: string
}

const PortfolioClient = () => {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const particlesInit = useCallback(async (engine: Engine) => { 
    await loadSlim(engine) 
  }, [])

  useEffect(() => {
    const fetchPortfolioData = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/portfolio')
        if (!response.ok) {
          throw new Error('Failed to fetch portfolio data')
        }
        const data = await response.json()
        setPortfolioData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchPortfolioData()
  }, [])

  if (loading) {
    return (
      <div className="px-6 md:px-16 bg-black text-white min-h-screen overflow-x-hidden relative">
        <main className="min-h-screen py-8 md:px-16 flex flex-col items-center z-10 relative">
          <div className="text-2xl">Loading portfolio...</div>
        </main>
      </div>
    )
  }

  if (error || !portfolioData) {
    return (
      <div className="px-6 md:px-16 bg-black text-white min-h-screen overflow-x-hidden relative">
        <main className="min-h-screen py-8 md:py-16 flex flex-col items-center z-10 relative">
          <h1 className="m-0 leading-tight text-4xl md:text-6xl font-bold tracking-tighter flex items-center gap-4 md:gap-6 text-white">Error</h1>
          <p className="text-gray-400">{error || 'No portfolio data available.'}</p>
        </main>
      </div>
    )
  }

  return (
    <>
      <div className="px-6 md:px-16 bg-black text-white min-h-screen overflow-x-hidden relative">
        <Particles 
          id="tsparticles" 
          init={particlesInit} 
          options={particlesOptions} 
          className="fixed inset-0 w-full h-full z-0 pointer-events-none" 
        />

        <main className="min-h-screen py-8 md:py-16 flex flex-col items-center z-10 relative">
          <Header 
            title="Portfolio"
            description="Track your index token performance and allocations"
            logoSrc="/logo.png"
          />

          <WalletBar />

          <div className="w-full max-w-7xl mx-auto space-y-8">
            <PortfolioStats 
              totalValue={portfolioData.totalValue}
              totalChange={portfolioData.totalChange}
              mintDate={portfolioData.mintDate}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <PortfolioChart tokens={portfolioData.tokens} />
              <TokenAllocation tokens={portfolioData.tokens} />
            </div>
          </div>
        </main>
      </div>
    </>
  )
}

export default PortfolioClient
