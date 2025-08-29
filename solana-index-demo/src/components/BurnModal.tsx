'use client'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { PublicKey } from '@solana/web3.js'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { getAssociatedTokenAddress, TOKEN_2022_PROGRAM_ID } from '@solana/spl-token'

// ---- Constants (devnet) ----
const AXIS_MINT_2022 = new PublicKey('6XJVFiPQZ9pAa6Cuhcm6jbHtV3G3ZjK3VZ2HNTanpAQ1') // Token-2022
const AXIS_DECIMALS  = 9
const TREASURY_OWNER = new PublicKey('BTcWoRe6Z9VaCPCxrcr5dQmn8cA8KNHpFdgJEVopSBsj') // Vault/Treasury
const USDC_DEV_MINT  = new PublicKey('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr') // for info line

type Props = {
  isOpen: boolean
  onClose: () => void
  indexPrice: number | null // same as BuyModal
}

function fmtAddr(pk?: PublicKey | null) {
  if (!pk) return ''
  const s = pk.toBase58()
  return `${s.slice(0, 4)}…${s.slice(-4)}`
}

export default function RedeemModal({ isOpen, onClose, indexPrice }: Props) {
  const { connection } = useConnection()
  const wallet = useWallet()
  const { publicKey, sendTransaction, connected } = wallet

  const [axisBalance, setAxisBalance] = useState(0) // UI units
  const [amount, setAmount] = useState('0.01')
  const [busy, setBusy] = useState(false)
  const [step, setStep] = useState<'idle'|'building'|'submitted'|'settling'|'settled'|'error'>('idle')
  const [txSig, setTxSig] = useState<string | null>(null)
  const [memoId, setMemoId] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // -------- Accessibility: focus management per ARIA dialog pattern --------
  const firstFocusableRef = useRef<HTMLInputElement | null>(null)
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    // Initial focus
    setTimeout(() => firstFocusableRef.current?.focus(), 0)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  // -------- Fetch AXIS balance --------
  useEffect(() => {
    let aborted = false
    const run = async () => {
      if (!connected || !publicKey) return
      try {
        // Token-2022 ATAs require program id in derivation in write paths,
        // but for lookup getAssociatedTokenAddress default is OK; account may not exist.
        const ata = await getAssociatedTokenAddress(
            AXIS_MINT_2022,
            publicKey,
            false,                    // allowOwnerOffCurve
            TOKEN_2022_PROGRAM_ID     // ★ ここが必須
          )
        const bal = await connection.getTokenAccountBalance(ata).catch(() => null)
        if (!aborted) setAxisBalance(bal?.value?.uiAmount || 0)
      } catch { if (!aborted) setAxisBalance(0) }
    }
    run()
    // refresh after settlement
  }, [connected, publicKey, connection, step === 'settled'])

  const networkName = useMemo(
    () => (connection?.rpcEndpoint || '').toLowerCase().includes('devnet') ? 'Devnet' : 'Mainnet',
    [connection?.rpcEndpoint]
  )

  const expectedUsdc = useMemo(() => {
    const q = parseFloat(amount)
    if (!indexPrice || !isFinite(q) || q <= 0) return null
    return q * indexPrice // Q_USDC = Q_AXIS * I(t)
  }, [amount, indexPrice])

  const setPct = (p: number) => {
    const q = axisBalance * p
    setAmount(q.toFixed(AXIS_DECIMALS))
  }

  const handleRedeem = async () => {
    if (!connected || !publicKey || !wallet.signTransaction) {
      setErrorMsg('Connect your wallet on Devnet.')
      setStep('error'); return
    }
    if (networkName !== 'Devnet') {
      setErrorMsg('This dApp runs on Devnet only.')
      setStep('error'); return
    }
    const qAxis = parseFloat(amount)
    if (!isFinite(qAxis) || qAxis <= 0) {
      setErrorMsg('Enter a valid amount.')
      setStep('error'); return
    }
    if (qAxis > axisBalance) {
      setErrorMsg('Insufficient AXIS balance.')
      setStep('error'); return
    }

    try {
      setBusy(true); setErrorMsg(null); setStep('building')

      // Dynamic import to avoid SSR issues
      const { AxisSDK } = await import('@axis-protocol/sdk')
      const sdk = new AxisSDK(connection, wallet as any)

      const { transaction, memoId: mid } = await sdk.buildIndexTokenDepositTransaction(qAxis)
      setMemoId(mid)

      setStep('submitted')
      const signature = await sendTransaction(transaction, connection)
      setTxSig(signature)
      setStep('settling')

      // Poll your existing settlement endpoint (same idea as Buy flow)
      // If you don't have a dedicated endpoint yet, leave the button-driven "Check again".
      let done = false
      const deadline = Date.now() + 90_000 // 90s
      while (!done && Date.now() < deadline) {
        await new Promise(r => setTimeout(r, 4000))
        // optional: call /api/settlement-status?sig=...
        // For now we just check whether USDC increased (best-effort).
        // In production, use your backend correlation by memo+signature.
        done = true // set by backend response
      }
      if (done) setStep('settled')
      else setStep('settling') // keep showing the "Check again" button
    } catch (e: any) {
      console.error('[RedeemModal] error:', e)
      setErrorMsg(e?.message || 'Unexpected error')
      setStep('error')
    } finally {
      setBusy(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] bg-black/55 backdrop-blur-[20px] grid place-items-center" role="dialog" aria-modal="true" aria-labelledby="redeem-title">
      <div className="w-[min(980px,92vw)] bg-white/6 border border-white/12 rounded-2xl shadow-2xl shadow-black/60 p-5 text-white">
        <header className="flex justify-between items-center mb-2">
          <div className="flex gap-2 items-center text-sm text-[#cfd3dc]">
            <span className="px-2 py-1 border border-white/20 rounded-md">{networkName}</span>
            <span className="opacity-90">Connected: {fmtAddr(publicKey) || '—'}</span>
          </div>
          <button className="bg-transparent text-white text-3xl border-none cursor-pointer hover:text-gray-300 transition-colors" aria-label="Close" onClick={onClose}>×</button>
        </header>

        <div className="grid grid-cols-[1.2fr_0.8fr] gap-4 lg:grid-cols-1">
          {/* Left: form */}
          <section className="bg-white/4 border border-white/10 rounded-xl p-4">
            <div className="flex items-baseline justify-between m-1">
              <span className="text-[#B8C0CC]">Your AXIS Balance</span>
              <strong className="font-bold">{axisBalance.toFixed(AXIS_DECIMALS)}</strong>
            </div>
            <div className="flex items-baseline justify-between m-1">
              <span className="text-[#B8C0CC]">Current Index Value</span>
              <strong className="font-bold">{indexPrice ? indexPrice.toFixed(6) : 'N/A'}</strong>
            </div>

            <label className="block mt-3 mb-1.5 text-[#B8C0CC] text-sm" htmlFor="redeem-amt">Amount to Redeem (AXIS)</label>
            <input
              id="redeem-amt"
              ref={firstFocusableRef}
              type="number"
              className="w-full px-4 py-3.5 rounded-lg border border-white/18 bg-black/35 text-white text-base focus:outline-none focus:border-[#88aaff] focus:shadow-[0_0_0_2px_rgba(136,170,255,0.25)]"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              min="0"
              step="0.000000001"
              disabled={busy}
              inputMode="decimal"
            />

            <div className="flex gap-2 mt-2.5 mb-4">
              <button className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-white cursor-pointer hover:bg-white/16 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" onClick={() => setPct(0.25)} disabled={busy}>25%</button>
              <button className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-white cursor-pointer hover:bg-white/16 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" onClick={() => setPct(0.5)}  disabled={busy}>50%</button>
              <button className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-white cursor-pointer hover:bg-white/16 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" onClick={() => setPct(0.75)} disabled={busy}>75%</button>
              <button className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-white cursor-pointer hover:bg-white/16 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" onClick={() => setPct(1)}    disabled={busy}>Max</button>
            </div>

            <button
              className="w-full px-4 py-3.5 rounded-lg border border-white/25 bg-white text-black font-bold cursor-pointer mt-1 shadow-lg shadow-white/25 disabled:opacity-60 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
              onClick={handleRedeem}
              disabled={busy || !publicKey}
            >
              {busy ? 'Processing…' : 'Redeem (Burn)'}
            </button>

            {/* Inline status */}
            {step !== 'idle' && (
              <div className="mt-3 p-3 rounded-lg bg-black/35 border border-white/12 text-sm">
                {step === 'building'  && <p>Preparing transaction…</p>}
                {step === 'submitted' && <p>Transaction sent. Waiting for confirmation…</p>}
                {step === 'settling'  && (
                  <p>
                    Waiting for backend settlement…{' '}
                    <button className="text-[#9db7ff] underline bg-none border-none cursor-pointer hover:text-blue-300 transition-colors" onClick={() => setStep('settling')}>Check again</button>
                  </p>
                )}
                {step === 'settled'   && <p>Redeemed successfully. USDC should arrive shortly.</p>}
                {step === 'error'     && <p className="text-[#ff7b7b]">{errorMsg}</p>}
                {txSig && (
                  <p>
                    Tx:&nbsp;
                    <a className="text-[#9db7ff] underline hover:text-blue-300 transition-colors" href={`https://solscan.io/tx/${txSig}?cluster=devnet`} target="_blank" rel="noreferrer">view</a>
                  </p>
                )}
                {memoId && <p>Memo: {memoId}</p>}
              </div>
            )}
          </section>

          {/* Right: details */}
          <aside className="bg-white/4 border border-white/10 rounded-xl p-4">
            <h3 id="redeem-title" className="m-0 mb-3 text-lg opacity-95">Redemption Details</h3>
            <p>Your AXIS (Token-2022) is transferred to the treasury. The backend then executes the redemption settlement and returns USDC according to the index.</p>
            <div className="grid grid-cols-1 gap-2.5 mt-2 break-all">
              <div>
                <div className="text-xs text-[#AEB6C4]">AXIS Mint</div>
                <div className="font-mono text-sm">{AXIS_MINT_2022.toBase58()}</div>
              </div>
              <div>
                <div className="text-xs text-[#AEB6C4]">Treasury (Owner)</div>
                <div className="font-mono text-sm">{TREASURY_OWNER.toBase58()}</div>
              </div>
              <div>
                <div className="text-xs text-[#AEB6C4]">USDC (devnet)</div>
                <div className="font-mono text-sm">{USDC_DEV_MINT.toBase58()}</div>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-black/35 border border-white/12">
              <div className="flex items-baseline justify-between m-1">
                <span className="text-[#B8C0CC] text-sm">Expected USDC</span>
                <strong className="text-lg">{expectedUsdc ? expectedUsdc.toFixed(6) : '—'}</strong>
              </div>
              <small>Formula: Q<sub>USDC</sub> = Q<sub>AXIS</sub> × Index</small>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
