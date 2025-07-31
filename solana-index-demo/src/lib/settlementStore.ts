// /src/lib/settlementStore.ts
export type SettlementPhase = 'pending' | 'paid' | 'failed'
export type SettlementSide  = 'mint' | 'burn'

export interface SettlementRecord {
  side: SettlementSide
  phase: SettlementPhase
  depositSig: string            // ユーザーが送った入金Tx
  memoId?: string
  usdcUi?: number
  axisUi?: number
  indexValue?: number
  payoutSig?: string            // サーバからの払い出しTx
  error?: string
  createdAt: number
  updatedAt: number
}

type Store = Map<string, SettlementRecord> // key = depositSig

const g = globalThis as any
if (!g.__AXIS_SETTLEMENT_STORE__) g.__AXIS_SETTLEMENT_STORE__ = new Map<string, SettlementRecord>()
const store: Store = g.__AXIS_SETTLEMENT_STORE__

export const putPending = (key: string, init: Omit<SettlementRecord, 'phase'|'createdAt'|'updatedAt'>) => {
  const rec: SettlementRecord = { ...init, phase: 'pending', createdAt: Date.now(), updatedAt: Date.now() }
  store.set(key, rec)
  return rec
}
export const markPaid = (key: string, patch: Partial<SettlementRecord>) => {
  const cur = store.get(key); if (!cur) return
  Object.assign(cur, patch, { phase: 'paid', updatedAt: Date.now() })
}
export const markFailed = (key: string, err: string, patch?: Partial<SettlementRecord>) => {
  const cur = store.get(key) || { side: 'mint' as SettlementSide, depositSig: key, createdAt: Date.now(), updatedAt: Date.now() } as SettlementRecord
  Object.assign(cur, patch, { phase: 'failed', error: err, updatedAt: Date.now() })
  store.set(key, cur)
}
export const getOne = (key: string) => store.get(key) || null
