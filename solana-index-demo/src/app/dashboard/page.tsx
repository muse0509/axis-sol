/* =====================================================
 * app/dashboard/page.tsx ― App Router server component
 * ===================================================== */

import { promises as fs } from 'fs'
import path from 'path'
import { marketEvents } from '../../lib/market-events'
import DashboardClient from './DashboardClient'

export const metadata = {
  title: 'Market Pulse Index',
  description: 'An equally weighted index to capture the true sentiment of the crypto market.',
}

type EChartsData  = (string | number)[][]

interface LatestEntry  { created_at: string; index_value: number }

async function loadData() {
  try {
    console.log('Loading dashboard data...')
    
    const csvPath = path.join(process.cwd(), './src/lib/data/data.csv')
    console.log('CSV path:', csvPath)
    
    const csvText = await fs.readFile(csvPath, 'utf8')
    console.log('CSV loaded, length:', csvText.length)

    const rows = csvText.trim().split('\n')
    const header = rows[0].split(',').map(h => h.trim())
    const data = rows.slice(1).map(line => {
      const cells = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || []
      const rec: any = {}
      header.forEach((k, i) => {
        const v = cells[i] ?? ''
        if (k === 'index_value') rec[k] = parseFloat(v)
        else rec[k] = v
      })
      return rec
    })

    if (!data.length) throw new Error('CSV is empty')
    console.log('Data processed, rows:', data.length)

    const dayMap = new Map<string, { open: number; high: number; low: number; close: number }>()
    data.forEach((r: any) => {
      if (!r.created_at || !r.index_value) return
      const day = new Date(r.created_at).toISOString().split('T')[0]
      const price = r.index_value as number
      if (!dayMap.has(day)) dayMap.set(day, { open: price, high: price, low: price, close: price })
      else {
        const p = dayMap.get(day)!
        p.high = Math.max(p.high, price)
        p.low  = Math.min(p.low,  price)
        p.close = price
      }
    })

    const echartsData: EChartsData = [...dayMap.entries()]
      .map(([d, ohlc]) => [d, ohlc.open, ohlc.close, ohlc.low, ohlc.high])
      .sort((a, b) => new Date(a[0] as string).getTime() - new Date(b[0] as string).getTime())

    const dailyChange = echartsData.length >= 2
      ? ((echartsData.at(-1)![2] as number) - (echartsData.at(-2)![2] as number)) / (echartsData.at(-2)![2] as number) * 100
      : null

    console.log('Data loaded successfully')
    return {
      initialLatestEntry: JSON.parse(JSON.stringify((data as any[]).at(-1))) as LatestEntry,
        echartsData,
      initialDailyChange: dailyChange as number | null,
        events: marketEvents,
      error: undefined as string | undefined,
    }
  } catch (err: any) {
    console.error('Error loading dashboard data:', err)
    return {
        initialLatestEntry: null,
        echartsData: null,
        initialDailyChange: null,
        events: marketEvents,
      error: err?.message ?? 'Failed to read CSV',
    }
  }
}

export default async function Page() {
  console.log('Dashboard page rendering...')
  const props = await loadData()
  console.log('Props loaded:', props)
  
  return (
    <DashboardClient
      initialLatestEntry={props.initialLatestEntry}
      echartsData={props.echartsData}
      initialDailyChange={props.initialDailyChange}
      events={props.events}
      error={props.error}
    />
  )
}
