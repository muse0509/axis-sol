import type { NextPage } from 'next'
import Head from 'next/head'
import { useCallback, useRef, useState, useEffect } from 'react'
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

const ImagePreviewModal = ({ imageUrl, onClose }: { imageUrl: string; onClose: () => void }) => {
  return (
    <motion.div
      className={styles.modalOverlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={styles.modalContent}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className={styles.modalCloseButton}><FiX /></button>
        <img src={imageUrl} alt="Generated Challenge Preview" className={styles.generatedImage} />
        <p className={styles.modalInstruction}>
          Press and hold (or right-click) the image to save.
        </p>
      </motion.div>
    </motion.div>
  )
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
  const [isPreparing, setIsPreparing] = useState(false)
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  // ★★★ デバイスがタッチ対応か判定するフラグ (一度だけ判定) ★★★
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  useEffect(() => {
    // クライアントサイドでのみ実行
    setIsTouchDevice(('ontouchstart' in window) || navigator.maxTouchPoints > 0);
  }, []);


  const particlesInit = useCallback(async (engine: Engine) => { await loadSlim(engine) }, [])

  // --- LOGIC ---
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

  const startDownloadProcess = () => {
    if(isDownloading) return;
    setIsPreparing(true)
  }

  // --- IMAGE GENERATION ---
  useEffect(() => {
    if (!isPreparing) return;
  
    const generateImage = async () => {
      const el = previewRef.current;
      if (!el) { setIsPreparing(false); return; }
  
      setIsDownloading(true);
      // このtry...finallyブロックはPC/スマホ共通
      try {
        if ((document as any).fonts?.ready) {
            try { await (document as any).fonts.ready; } catch(e) { console.warn('Font ready API failed.', e) }
        }
        window.scrollTo(0, 0);

        // (この部分のスタイル操作は元のコードと同じです)
        const originalStyle = {
            transform: el.style.transform, maxHeight: el.style.maxHeight,
            height: el.style.height, overflow: el.style.overflow
        };
        el.style.transform = 'none'; el.style.maxHeight = 'none';
        el.style.height = 'auto'; el.style.overflow = 'visible';
        await new Promise(res => requestAnimationFrame(res));
  
        const handleEl = el.querySelector('#handle-preview') as HTMLElement | null;
        const originalText = handleEl?.textContent ?? '';
        if (handleEl) handleEl.textContent = twitterHandle || '@your_handle';
        const now = new Date();
        const tsText = new Intl.DateTimeFormat('ja-JP', {
            timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short', hour12: false,
        }).format(now);

        const canvas = await html2canvas(el, {
          scale: 2, useCORS: true, backgroundColor: null, scrollX: -window.scrollX,
          scrollY: -window.scrollY, windowWidth: document.documentElement.offsetWidth,
          windowHeight: document.documentElement.offsetHeight,
          onclone: (doc) => {
            const hNode = doc.getElementById('handle-preview');
            if (hNode) hNode.textContent = twitterHandle || '@your_handle';
            const p = doc.getElementById('preview-particles');
            if (p) (p as HTMLElement).style.visibility = 'hidden';
            const tsNode = doc.getElementById('timestamp') as HTMLElement | null;
            if (tsNode) {
              tsNode.textContent = `Created: ${tsText}`;
              tsNode.style.display = 'block';
            }
          },
        });
        
        // ★★★ ここでPCとスマホの処理を分岐 ★★★
        if (isTouchDevice) {
          // 【スマホの場合】モーダルで画像を表示
          const imageUrl = canvas.toDataURL('image/png');
          setGeneratedImageUrl(imageUrl);
        } else {
          // 【PCの場合】画像を直接ダウンロード
          const image = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.href = image;
          link.download = 'AxisAnalystChallenge.png';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
  
        // スタイルを元に戻す
        if (handleEl) handleEl.textContent = originalText;
        el.style.transform = originalStyle.transform; el.style.maxHeight = originalStyle.maxHeight;
        el.style.height = originalStyle.height; el.style.overflow = originalStyle.overflow;

      } catch (e) {
        console.error(e);
        alert('An error occurred while generating the image. Please try again.');
      } finally {
        setIsDownloading(false);
        setIsPreparing(false);
      }
    };
  
    generateImage();
  }, [isPreparing, twitterHandle, isTouchDevice]); // ★★★ 依存配列に isTouchDevice を追加 ★★★


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

      {/* モーダルは isTouchDevice で表示/非表示を制御する必要はない */}
      {/* generatedImageUrl がセットされた時だけ表示されるため、スマホの時しか表示されない */}
      <AnimatePresence>
        {generatedImageUrl && (
            <ImagePreviewModal
                imageUrl={generatedImageUrl}
                onClose={() => setGeneratedImageUrl(null)}
            />
        )}
      </AnimatePresence>

      <Particles id="tsparticles" init={particlesInit} options={particlesOptions} className={styles.particles} />

      <main className={styles.main}>
        <div className={styles.previewPanel}>
          <div ref={previewRef} className={styles.previewContainer}>
            <Particles id="preview-particles" options={{ ...particlesOptions, background: { color: { value: '#000' } } }} className={styles.previewParticles} />
            <div className={styles.previewHeader}>
              <h1 className={styles.italicTitle}>My #AxisAnalystChallenge 🏆</h1>
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
              <span>Analysis by: <span id="handle-preview">{twitterHandle || '@your_handle'}</span></span>
              <span>Tag @Axis__Solana to participate!</span>
            </div>
            <div id="timestamp" className={styles.timestamp} aria-hidden="true"></div>
          </div>
        </div>

        <div className={`${styles.controlPanel} ${styles.glass}`}>
          {/* ... Panel 1-3 は変更なし ... */}
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

          <div className={styles.actionSection}>
            <h2 className={styles.controlTitle}>4. Finalize & Share</h2>
            <div className={styles.handleInputGroup}>
              <label>Your X Handle</label>
              <input type="text" placeholder="@your_handle" value={twitterHandle} onChange={(e) => setTwitterHandle(e.target.value)} />
            </div>
            <div className={styles.actionButtons}>
              <button onClick={startDownloadProcess} className={styles.downloadButton} disabled={isDownloading}>
                <FiDownload />
                {/* ★★★ ボタンのテキストを分かりやすく変更 ★★★ */}
                <span>{isDownloading ? 'Generating...' : (isTouchDevice ? 'Generate Image' : 'Download Image')}</span>
              </button>
              <p className={styles.instructionText}>
                {isTouchDevice ? 'Generate image first, then post it!' : 'Download the image and then post it!'}
              </p>
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