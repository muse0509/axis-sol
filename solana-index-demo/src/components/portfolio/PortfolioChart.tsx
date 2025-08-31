'use client';

import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'

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

interface PortfolioChartProps {
  tokens: TokenData[]
}

const PortfolioChart = ({ tokens }: PortfolioChartProps) => {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    // Initialize chart
    chartInstance.current = echarts.init(chartRef.current)

    // Chart options
    const option = {
      backgroundColor: 'transparent',
      title: {
        text: 'Portfolio Allocation',
        left: 'center',
        top: 20,
        textStyle: {
          color: '#ffffff',
          fontSize: 18,
          fontWeight: 'bold'
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderColor: '#333',
        textStyle: {
          color: '#fff'
        }
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        top: 'middle',
        textStyle: {
          color: '#ffffff'
        },
        itemGap: 12
      },
      series: [
        {
          name: 'Allocation',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['60%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#000',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '18',
              fontWeight: 'bold',
              color: '#ffffff'
            }
          },
          labelLine: {
            show: false
          },
          data: tokens.map((token, index) => ({
            value: token.allocation,
            name: token.symbol,
            itemStyle: {
              color: [
                '#3B82F6', // Blue
                '#10B981', // Green
                '#F59E0B', // Yellow
                '#EF4444', // Red
                '#8B5CF6', // Purple
                '#06B6D4', // Cyan
                '#F97316', // Orange
                '#EC4899', // Pink
                '#84CC16', // Lime
                '#6B7280'  // Gray
              ][index % 10]
            }
          }))
        }
      ]
    }

    chartInstance.current.setOption(option)

    // Handle resize
    const handleResize = () => {
      chartInstance.current?.resize()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chartInstance.current?.dispose()
    }
  }, [tokens])

  return (
    <div className="w-full bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800">
      <div ref={chartRef} className="w-full h-80" />
    </div>
  )
}

export default PortfolioChart
