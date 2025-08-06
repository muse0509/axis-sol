import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { useCallback, useRef, useState, useEffect } from 'react' // useEffect をインポート
import html2canvas from 'html2canvas'
import { motion, AnimatePresence } from 'framer-motion'
import Particles from 'react-tsparticles'
import type { Engine } from 'tsparticles-engine'
import { loadSlim } from 'tsparticles-slim'
import { FiDownload, FiPlus, FiX } from 'react-icons/fi'
import { FaXTwitter } from 'react-icons/fa6'
import { particlesOptions } from '../utils/particles'
import styles from '../styles/Challenge.module.css'
import { CURRENT_CONSTITUENTS } from '../lib/constituents'

type TokenInfo = {
  id: string
  symbol: string
  reason: string
}

const ChallengePage: NextPage = () => {
  // --- STATE MANAGEMENT ---
  const [constituents, setConstituents] = useState<string[]>(CURRENT_CONSTITUENTS)
  const [removedTokens, setRemovedTokens] = useState<TokenInfo[]>([])
  const [addedTokens, setAddedTokens] = useState<TokenInfo[]>([])
  const [newTokenSymbol, setNewTokenSymbol] = useState('')
  const [newTokenReason, setNewTokenReason] = useState('')
  const [twitterHandle, setTwitterHandle] = useState('@your_handle')

  const previewRef = useRef<HTMLDivElement>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  // ★★★ 新しいstateを追加: 画像生成の準備状態を管理 ★★★
  const [isPreparing, setIsPreparing] = useState(false)

  const particlesInit = useCallback(async (engine: Engine) => { await loadSlim(engine) }, [])

  // --- LOGIC (No Changes) ---
  const handleRemove = (symbol: string) => {
    if (removedTokens.length >= 3) { alert('You can only remove up to 3 tokens.'); return }
    setConstituents(constituents.filter(s => s !== symbol))
    setRemovedTokens([...removedTokens, { id: symbol, symbol, reason: '' }])
  }
  const handleRevertRemove = (token: TokenInfo) => {
    setRemovedTokens(removedTokens.filter(t => t.id !== token.id))
    setConstituents([...constituents, token.symbol].sort())
  }
  const handleReasonChange = (id: string, reason: string) => {
    setRemovedTokens(removedTokens.map(t => t.id === id ? { ...t, reason } : t))
  }
  const handleAddToken = () => {
    const symbolToAdd = newTokenSymbol.trim().toUpperCase()
    if (!symbolToAdd) { alert('Please enter a token symbol.'); return }
    if (addedTokens.length >= 3) { alert('You can only add up to 3 tokens.'); return }
    if (CURRENT_CONSTITUENTS.includes(symbolToAdd)) { alert(`${symbolToAdd} is already in the current index.`); return }
    if (addedTokens.some(t => t.symbol === symbolToAdd)) { alert(`${symbolToAdd} has already been added.`); return }
    const newId = `${symbolToAdd}-${Date.now()}`
    setAddedTokens([...addedTokens, { id: newId, symbol: symbolToAdd, reason: newTokenReason }])
    setNewTokenSymbol('')
    setNewTokenReason('')
  }
  const handleDeleteAdded = (id: string) => {
    setAddedTokens(addedTokens.filter(t => t.id !== id))
  }

  // ★★★ 修正点 1: ボタンクリック時の処理をシンプル化 ★★★
  // この関数は、画像生成の「準備開始」を指示するだけになります。
  const startDownloadProcess = () => {
    setIsPreparing(true)
  }

  // ★★★ 修正点 2: 画像生成の本体をuseEffectに移動 ★★★
  // isPreparingがtrueになった後（＝画面更新が完了した後）に、この中身が実行されます。
  useEffect(() => {
    if (!isPreparing) return;
  
    const generateImage = async () => {
      const el = previewRef.current;
      if (!el) { setIsPreparing(false); return; }
  
      setIsDownloading(true);
      try {
        // 0) 文字欠け対策（任意・前回提案と同じ）
        if ((document as any).fonts?.ready) {
          try { await (document as any).fonts.ready; } catch {}
        }
  
        // 1) スクロール起因のオフセットずれを避ける（既知のワークアラウンド）
        window.scrollTo(0, 0); // ← 重要
  
        // 2) キャプチャ用に一時的に「内容ぶんのサイズ」に広げる
        const prevStyle = {
          height: el.style.height,
          maxHeight: el.style.maxHeight,
          overflow: el.style.overflow,
          transform: el.style.transform,
        };
  
        // Framer Motion 等の transform があると計測が狂うことがあるので一時解除
        el.style.transform = 'none';
        // 重要：overflow を可視化、固定高さを解除
        el.style.maxHeight = 'none';
        el.style.overflow  = 'visible';
  
        // scroll サイズを計測
        const w = el.scrollWidth;
        const h = el.scrollHeight;
        el.style.height = h + 'px';
  
        // レイアウト反映を 1 フレーム待つ
        await new Promise(requestAnimationFrame);
  
        const handleEl = el.querySelector('#handle-preview') as HTMLElement | null;
        const originalText = handleEl?.textContent ?? '';
        if (handleEl) handleEl.textContent = twitterHandle || '@your_handle';
  
        const canvas = await html2canvas(el, {
          // ← ここが切れ対策の肝：内容ぶんの幅・高さで確定撮り
          width: w,
          height: h,
          windowWidth: w,
          windowHeight: h,
          // 念のためスクロールの影響を排除
          scrollX: 0,
          scrollY: 0,
          scale: 2,
          useCORS: true,
          backgroundColor: null,
          onclone: (doc) => {
            const hNode = doc.getElementById('handle-preview');
            if (hNode) hNode.textContent = twitterHandle || '@your_handle';
            // 背景の Particles など、不要ならここで非表示にしてもOK
            const p = doc.getElementById('preview-particles');
            if (p) (p as HTMLElement).style.visibility = 'hidden';
          },
        });
  
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = image;
        link.download = 'AxisAnalystChallenge.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
  
        // 復元
        if (handleEl) handleEl.textContent = originalText;
        el.style.height    = prevStyle.height;
        el.style.maxHeight = prevStyle.maxHeight;
        el.style.overflow  = prevStyle.overflow;
        el.style.transform = prevStyle.transform;
      } catch (e) {
        console.error(e);
        alert('An error occurred while generating the image. Please try again.');
      } finally {
        setIsDownloading(false);
        setIsPreparing(false);
      }
    };
  
    generateImage();
  }, [isPreparing, twitterHandle]);
   // isPreparingが変更された時に実行


  // --- X SHARE URL ---
  const shareText = `Here's my entry for the #AxisAnalystChallenge! What do you think? @Axis__Solana`
  const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`

  // --- RENDERING ---
  return (
    <div className={styles.container}>
      <Head>
        <title>Axis Analyst Challenge - Image Generator</title>
        <meta name="description" content="Create your custom image for the #AxisAnalystChallenge" />
      </Head>

      <Particles id="tsparticles" init={particlesInit} options={particlesOptions} className={styles.particles} />

      <main className={styles.main}>
        {/* Upper Preview Panel */}
        <div className={styles.previewPanel}>
          <div ref={previewRef} className={styles.previewContainer}>
            <Particles id="preview-particles" options={{ ...particlesOptions, background: { color: { value: '#000' } } }} className={styles.previewParticles} />
            <div className={styles.previewHeader}>
              <h1 className={styles.italicTitle}>My #AxisAnalystChallenge</h1>
              <p>Index Rebalance Thesis</p>
            </div>
            <div className={styles.previewContent}>
              <div className={styles.column}>
                <h3>REMOVE</h3>
                {removedTokens.map((token) => (
                  <div key={`remove-prev-${token.id}`} className={`${styles.tokenCard} ${styles.removeCard}`}><h4>{token.symbol}</h4><p>{token.reason || 'Reasoning not provided.'}</p></div>
                ))}
              </div>
              <div className={styles.column}>
                <h3>ADD</h3>
                {addedTokens.map((token) => (
                  <div key={`add-prev-${token.id}`} className={`${styles.tokenCard} ${styles.addCard}`}><h4>{token.symbol}</h4><p>{token.reason || 'Reasoning not provided.'}</p></div>
                ))}
              </div>
            </div>
            <div className={styles.previewFooter}>
              <span>Analysis by: 
                <strong id="handle-preview">{twitterHandle || '@your_handle'}</strong>
              </span>
              <span>Tag @Axis__Solana to participate!</span>
            </div>
          </div>
        </div>

        {/* Lower Control Panel */}
        <div className={`${styles.controlPanel} ${styles.glass}`}>
          {/* Panel 1-3 ... (変更なし) */}
          <div className={styles.controlSection}>
            <h2 className={styles.controlTitle}>1. Select Tokens to Remove</h2>
            <motion.div layout className={styles.tokenGrid}><AnimatePresence>{constituents.map(symbol => (<motion.div key={symbol} layoutId={symbol} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} onClick={() => handleRemove(symbol)} className={styles.tokenPill} whileHover={{ scale: 1.1, backgroundColor: '#333' }}>{symbol}</motion.div>))}</AnimatePresence></motion.div>
          </div>
          <div className={styles.controlSection}>
            <h2 className={`${styles.controlTitle} ${styles.removedTitle}`}>2. Reason for Removal ({removedTokens.length}/3)</h2>
            <div className={styles.listContainer}><AnimatePresence>{removedTokens.map(token => (<motion.div key={token.id} layoutId={token.id} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -50 }} className={styles.listCard}><div className={styles.listCardHeader}><span>{token.symbol}</span><button onClick={() => handleRevertRemove(token)} className={styles.revertButton}><FiX /></button></div><textarea placeholder="Your reasoning..." value={token.reason} onChange={(e) => handleReasonChange(token.id, e.target.value)} rows={2} /></motion.div>))}</AnimatePresence></div>
          </div>
          <div className={styles.controlSection}>
            <h2 className={`${styles.controlTitle} ${styles.addedTitle}`}>3. Add New Tokens ({addedTokens.length}/3)</h2>
            {addedTokens.length < 3 && (<div className={styles.addForm}><input type="text" placeholder="Symbol" value={newTokenSymbol} onChange={(e) => setNewTokenSymbol(e.target.value)} maxLength={10} /><input type="text" placeholder="Reasoning (optional)" value={newTokenReason} onChange={(e) => setNewTokenReason(e.target.value)} /><button onClick={handleAddToken}><FiPlus /></button></div>)}
            <div className={styles.listContainer}>{addedTokens.map(token => (<motion.div key={token.id} layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} className={styles.listCard}><div className={styles.listCardHeader}><span>{token.symbol}</span><button onClick={() => handleDeleteAdded(token.id)} className={styles.revertButton}><FiX /></button></div><p className={styles.reasonText}>{token.reason || 'No reason provided.'}</p></motion.div>))}</div>
          </div>

          {/* Panel 4: Finalize & Share */}
          <div className={styles.actionSection}>
            <h2 className={styles.controlTitle}>4. Finalize & Share</h2>
            <div className={styles.handleInputGroup}>
              <label>Your X Handle</label>
              <input type="text" placeholder="@your_handle" value={twitterHandle} onChange={(e) => setTwitterHandle(e.target.value)} />
            </div>
            <div className={styles.actionButtons}>
              {/* ★★★ ボタンがクリックされたら新しい関数を呼ぶ ★★★ */}
              <button onClick={startDownloadProcess} className={styles.downloadButton} disabled={isDownloading}>
                <FiDownload />
                <span>{isDownloading ? 'Generating...' : 'Download Image'}</span>
              </button>
              <p className={styles.instructionText}>Download the image and then post it!</p>
              <a href={shareUrl} target="_blank" rel="noopener noreferrer" className={styles.shareButton}>
                <FaXTwitter />
                <span>Post on X</span>
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ChallengePage