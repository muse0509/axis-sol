'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { ModernCard, GridLayout } from '../../../components/common';

const IndexValueCard = dynamic(() => import('../../../components/dashboard/IndexValueCard'), { ssr: false });
const ConstituentsGrid = dynamic(() => import('../../../components/dashboard/ConstituentsGrid'), { ssr: false });
const ChartSection = dynamic(() => import('../../../components/dashboard/ChartSection'), { ssr: false });
const EventTimeline = dynamic(() => import('../../../components/dashboard/EventTimeline'), { ssr: false });

interface RealTimeAsset {
  symbol: string;
  currentPrice: number;
  change24h: number | null;
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
};

const API_BASE = 'https://axis-trigger.kidneyweakx.workers.dev';

interface DashboardTabProps {
  initialLatestEntry: any;
  echartsData: any;
  initialDailyChange: number | null;
  events: any[];
  error?: string;
}

const DashboardTab = ({ 
  initialLatestEntry, 
  echartsData, 
  initialDailyChange, 
  events 
}: DashboardTabProps) => {
  const [assets, setAssets] = useState<RealTimeAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState<number | null>(null);

  useEffect(() => {
    const es = new EventSource('/api/price-stream');
    es.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg.type !== 'prices') return;
        const latest: Record<string, number> = {};
        (msg.payload as any[]).forEach(({ id, price }) => {
          const canon = String(id).toLowerCase().replace(/^0x/, '');
          const expo = (price as any).expo ?? (price as any).exponent ?? 0;
          const p = Number((price as any).price);
          latest[canon] = p * Math.pow(10, expo);
        });
        const mapped: RealTimeAsset[] = Object.entries(ID_TO_SYMBOL).map(([id, sym]) => ({
          symbol: sym,
          currentPrice: latest[id] ?? 0,
          change24h: null,
        }));
        setAssets(prev => {
          const same = prev.length === mapped.length && prev.every((p, i) =>
            p.symbol === mapped[i].symbol && p.currentPrice === mapped[i].currentPrice
          );
          return same ? prev : mapped;
        });
        setLoading(false);
      } catch {}
    };
    es.onerror = () => { /* rely on auto-reconnect */ };
    return () => es.close();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const fetchIndex = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/famcindexprice`);
        if (!res.ok) return;
        const data: { indexPrice: number } = await res.json();
        if (!cancelled && typeof data.indexPrice === 'number') {
          setCurrentIdx(data.indexPrice);
        }
      } catch {}
    };
    fetchIndex();
    const id = setInterval(fetchIndex, 5000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  if (!initialLatestEntry || !echartsData?.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400 text-lg">No data available</p>
      </div>
    );
  }

  const latestClose = echartsData.at(-1)![2] as number;
  const baseOpen = echartsData[0][1] as number;
  const fallbackIdx = baseOpen ? (latestClose / baseOpen) * 100 : 0;
  const displayedIdx = currentIdx ?? fallbackIdx;

  return (
    <div className="space-y-4">
      {/* Index Value Card */}
      <div className="flex justify-center">
        <IndexValueCard 
          indexValue={displayedIdx}
          dailyChange={initialDailyChange}
        />
      </div>

      {/* Main Content Grid */}
      <GridLayout cols={2} gap="md">
        {/* Constituents Grid */}
        <ModernCard className="p-4" gradient>
          <ConstituentsGrid 
            assets={assets}
            loading={loading}
          />
        </ModernCard>

        {/* Chart Section */}
        <ModernCard className="p-4" dark>
          <ChartSection 
            echartsData={echartsData}
            events={events}
          />
        </ModernCard>
      </GridLayout>

      {/* Event Timeline - Compact */}
      <ModernCard className="p-4" dark>
        <EventTimeline events={events} />
      </ModernCard>
    </div>
  );
};

export default DashboardTab;
