'use client'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { PublicKey } from '@solana/web3.js'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { getAssociatedTokenAddress } from '@solana/spl-token'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import SettlementModal from './SettlementModal'

// ---- Constants (devnet) ----
const USDC_MINT = new PublicKey('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr')
const TREASURY_USDC_ATA = new PublicKey('GPrfbGCK2rBEYL2jy7mMq9pYBht1tTss6ZfLUwU1jxrB')
const AXIS_MINT_2022 = new PublicKey('6XJVFiPQZ9pAa6Cuhcm6jbHtV3G3ZjK3VZ2HNTanpAQ1') // 参考情報用

// ---- Helpers ----
const fmtAddr = (pk?: PublicKey | null) => {
  if (!pk) return ''
  const s = pk.toBase58()
  return `${s.slice(0, 4)}…${s.slice(-4)}`
}

async function getUserUsdcBalance(conn: any, owner: PublicKey) {
  try {
    const ata = await getAssociatedTokenAddress(USDC_MINT, owner)
    const bal = await conn.getTokenAccountBalance(ata)
    return bal.value.uiAmount || 0
  } catch { return 0 }
}

export default function BuyModal({ isOpen, onClose, indexPrice }: { isOpen: boolean; onClose: () => void; indexPrice: number | null }) {
  const { connection } = useConnection()
  const wallet = useWallet()
  const { publicKey, sendTransaction, connected } = wallet

  const [usdcBalance, setUsdcBalance] = useState(0)
  const [amount, setAmount] = useState('10.0') // `qty`から`amount`に改名
  const [busy, setBusy] = useState(false) // `loading`から`busy`に改名

  // settlement modal state
  const [settleOpen, setSettleOpen] = useState(false)
  const [depositSig, setDepositSig] = useState<string>()
  const [memoId, setMemoId] = useState<string>()

  // --- Accessibility & Focus Management ---
  const firstFocusableRef = useRef<HTMLInputElement | null>(null)
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    setTimeout(() => firstFocusableRef.current?.focus(), 0)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  const networkName = useMemo(
    () => (connection?.rpcEndpoint || '').toLowerCase().includes('devnet') ? 'Devnet' : 'Mainnet',
    [connection?.rpcEndpoint]
  )

  // --- Fetch USDC balance ---
  useEffect(() => {
    if (publicKey && isOpen) {
      getUserUsdcBalance(connection, publicKey).then(setUsdcBalance)
    }
    // loading/busy状態が解除された後にも残高を更新
  }, [publicKey, connection, isOpen, busy])

  const expectedAxis = useMemo(() => {
    const q = parseFloat(amount)
    if (!indexPrice || !isFinite(q) || q <= 0) return null
    return q / indexPrice // Q_AXIS = Q_USDC / I(t)
  }, [amount, indexPrice])

  const setPct = (p: number) => {
    const value = usdcBalance * p
    setAmount(value.toFixed(6)) // USDCは6桁の精度が一般的
  }

  const handleBuy = async () => {
    if (!connected || !publicKey || !wallet.signTransaction) return alert('Please connect your wallet.')
    if (networkName !== 'Devnet') return alert('This dApp runs on Devnet only.')

    const usdcAmount = parseFloat(amount)
    if (!isFinite(usdcAmount) || usdcAmount <= 0) return alert('Please enter a valid amount.')
    if (usdcAmount > usdcBalance) return alert('Insufficient USDC balance.')

    try {
      setBusy(true)
      const { AxisSDK } = await import('@axis-protocol/sdk')
      const sdk = new AxisSDK(connection, wallet as any)
      
      const { transaction, memoId: mid } = await sdk.buildUsdcDepositTransaction(usdcAmount)
      setMemoId(mid)
      
      const signature = await sendTransaction(transaction, connection)
      setDepositSig(signature)
      setSettleOpen(true) // Open settlement progress modal

      // You can await confirmation here if needed, but the settlement modal handles the user view
      await connection.confirmTransaction(signature, 'confirmed')

    } catch (e: any) {
      console.error('[BuyModal] handleBuy error:', e)
      alert(e?.message || 'An unexpected error occurred.')
    } finally {
      setBusy(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/55 backdrop-blur-[20px] grid place-items-center" role="dialog" aria-modal="true" aria-labelledby="buy-title">
        <div className="w-[min(980px,92vw)] bg-white/6 border border-white/12 rounded-2xl shadow-2xl shadow-black/60 p-5 text-white">
          <header className="flex justify-between items-center mb-2">
            <div className="flex gap-2 items-center text-sm text-[#cfd3dc]">
              <span className="px-2 py-1 border border-white/20 rounded-md">{networkName}</span>
              <span className="opacity-90">Connected: {fmtAddr(publicKey) || '—'}</span>
            </div>
            <button className="bg-transparent text-white text-3xl border-none cursor-pointer hover:text-gray-300 transition-colors" aria-label="Close" onClick={onClose}>×</button>
          </header>

          <div className="grid grid-cols-[1.2fr_0.8fr] gap-4 lg:grid-cols-1">
            {/* Left: form (RedeemModalの構成に合わせる) */}
            <section className="bg-white/4 border border-white/10 rounded-xl p-4">
              <div className="flex items-baseline justify-between m-1">
                <span className="text-[#B8C0CC]">Your USDC Balance</span>
                <strong className="font-bold">{usdcBalance.toFixed(6)}</strong>
              </div>
              <div className="flex items-baseline justify-between m-1">
                <span className="text-[#B8C0CC]">Current Index Price</span>
                <strong className="font-bold">{indexPrice ? `$${indexPrice.toFixed(4)}` : 'N/A'}</strong>
              </div>

              <label className="block mt-3 mb-1.5 text-[#B8C0CC] text-sm" htmlFor="buy-amt">Amount to Spend (USDC)</label>
              <input
                id="buy-amt"
                ref={firstFocusableRef}
                type="number"
                className="w-full px-4 py-3.5 rounded-lg border border-white/18 bg-black/35 text-white text-base focus:outline-none focus:border-[#88aaff] focus:shadow-[0_0_0_2px_rgba(136,170,255,0.25)]"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                min="0"
                step="0.01"
                disabled={busy || !connected}
                inputMode="decimal"
              />

              <div className="flex gap-2 mt-2.5 mb-4">
                <button className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-white cursor-pointer hover:bg-white/16 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" onClick={() => setPct(0.25)} disabled={busy || !connected}>25%</button>
                <button className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-white cursor-pointer hover:bg-white/16 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" onClick={() => setPct(0.5)}  disabled={busy || !connected}>50%</button>
                <button className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-white cursor-pointer hover:bg-white/16 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" onClick={() => setPct(0.75)} disabled={busy || !connected}>75%</button>
                <button className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-white cursor-pointer hover:bg-white/16 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" onClick={() => setPct(1)}    disabled={busy || !connected}>Max</button>
              </div>

              {connected ? (
                <button
                  className="w-full px-4 py-3.5 rounded-lg border border-white/25 bg-white text-black font-bold cursor-pointer mt-1 shadow-lg shadow-white/25 disabled:opacity-60 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                  onClick={handleBuy}
                  disabled={busy || !publicKey}
                >
                  {busy ? 'Processing…' : 'Buy AXIS'}
                </button>
              ) : (
                <div style={{marginTop: '1rem'}}><WalletMultiButton /></div>
              )}
            </section>

            {/* Right: details (RedeemModalの構成に合わせる) */}
            <aside className="bg-white/4 border border-white/10 rounded-xl p-4">
              <h3 id="buy-title" className="m-0 mb-3 text-lg opacity-95">Purchase Details</h3>
              <p>Your USDC is transferred to the treasury. The backend then settles the order and mints new AXIS tokens to your wallet.</p>
              
              <div className="grid grid-cols-1 gap-2.5 mt-2 break-all">
                <div>
                  <div className="text-xs text-[#AEB6C4]">Receiving Token (AXIS)</div>
                  <div className="font-mono text-sm">{AXIS_MINT_2022.toBase58()}</div>
                </div>
                <div>
                  <div className="text-xs text-[#AEB6C4]">Treasury USDC ATA</div>
                  <div className="font-mono text-sm">{TREASURY_USDC_ATA.toBase58()}</div>
                </div>
                 <div>
                  <div className="text-xs text-[#AEB6C4]">Spending Token (USDC)</div>
                  <div className="font-mono text-sm">{USDC_MINT.toBase58()}</div>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-lg bg-black/35 border border-white/12">
                <div className="flex items-baseline justify-between m-1">
                  <span className="text-[#B8C0CC] text-sm">Expected AXIS</span>
                  <strong className="text-lg">{expectedAxis ? `~ ${expectedAxis.toFixed(6)}` : '—'}</strong>
                </div>
                <small>Formula: Q<sub>AXIS</sub> = Q<sub>USDC</sub> / Index</small>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* SettlementModalはそのまま利用 */}
      <SettlementModal
        open={settleOpen}
        onClose={() => setSettleOpen(false)}
        depositSig={depositSig!}
        memoId={memoId}
        expectedText={expectedAxis ? `~ ${expectedAxis.toFixed(6)} AXIS` : undefined}
        explorerBase="https://solscan.io"
      />
    </>
  )
}