'use client';
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
import { particlesOptions } from '../../utils/particles'
import { CURRENT_CONSTITUENTS } from '../../lib/constituents'

type TokenInfo = {
  id: string
  symbol: string
  reason: string
}

const ImagePreviewModal = ({ imageUrl, onClose }: { imageUrl: string; onClose: () => void }) => {
  return (
    <motion.div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[1000] p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative bg-base-300 p-8 pt-10 rounded-2xl flex flex-col items-center gap-4 max-w-full max-h-[90vh]"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-2.5 right-2.5 bg-transparent border-none text-white text-2xl cursor-pointer z-10"><FiX /></button>
        <img src={imageUrl} alt="Generated Challenge Preview" className="max-w-full max-h-[70vh] object-contain rounded-lg" />
        <p className="text-base-content/70 text-center text-sm">
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
    <div className="bg-black text-white min-h-screen min-h-dvh relative">
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

      <Particles id="tsparticles" init={particlesInit} options={particlesOptions} className="fixed inset-0 w-full h-full -z-10" />

      <main className="flex flex-col items-center gap-8 w-full p-4 sm:p-6 lg:h-screen lg:dvh lg:p-0 lg:m-0 lg:gap-0">
        {/* Preview Section */}
        <div className="w-full flex justify-center items-center lg:flex-grow lg:p-4 lg:overflow-hidden">
          <div 
            ref={previewRef} 
            className="w-full max-w-[600px] aspect-[1200/675] border border-white/10 rounded-2xl p-4 sm:p-6 relative overflow-hidden flex flex-col bg-[#0d0d0d] lg:w-[1200px] lg:h-[675px] lg:max-w-none lg:scale-[0.65] lg:origin-center lg:rounded-lg lg:bg-black lg:p-12"
          >
            <Particles 
              id="preview-particles" 
              options={{ ...particlesOptions, background: { color: { value: '#000' } } }} 
              className="absolute inset-0 w-full h-full z-0" 
            />
            
            {/* Header */}
            <div className="text-center mb-4 z-10 relative lg:mb-5">
              <h1 className="text-xl sm:text-2xl italic font-bold lg:text-5xl lg:font-extrabold lg:tracking-tight lg:drop-shadow-lg">
                My #AxisAnalystChallenge 🏆
              </h1>
              <p className="text-sm sm:text-base text-gray-400 lg:text-2xl">Index Rebalance Thesis</p>
            </div>
            
            {/* Content Grid */}
            <div className="flex gap-3 sm:gap-4 flex-grow lg:grid lg:grid-cols-2 lg:gap-10 lg:px-5">
              {/* Remove Section */}
              <div className="flex-1 flex flex-col gap-2 sm:gap-3 lg:gap-5">
                <h3 className="text-lg sm:text-xl mb-2 text-red-500 lg:text-3xl lg:font-bold lg:mb-5 lg:pb-2.5 lg:border-b-2 lg:border-red-500">
                  REMOVE
                </h3>
                {removedTokens.map((token) => (
                  <div 
                    key={`remove-prev-${token.id}`} 
                    className="p-3 rounded-lg border border-red-500/50 bg-red-500/10 lg:bg-black/40 lg:border-white/10 lg:backdrop-blur-sm lg:rounded-xl lg:p-5 lg:min-h-[100px] lg:flex lg:flex-col lg:justify-center lg:mb-4"
                  >
                    <h4 className="text-sm sm:text-base font-semibold mb-1 lg:text-2xl lg:font-semibold lg:uppercase">
                      {token.symbol}
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed lg:text-base lg:leading-relaxed lg:m-0 lg:break-words lg:whitespace-pre-wrap">
                      {token.reason || 'Reasoning not provided.'}
                    </p>
                  </div>
                ))}
              </div>
              
              {/* Add Section */}
              <div className="flex-1 flex flex-col gap-2 sm:gap-3 lg:gap-5">
                <h3 className="text-lg sm:text-xl mb-2 text-green-500 lg:text-3xl lg:font-bold lg:mb-5 lg:pb-2.5 lg:border-b-2 lg:border-green-500">
                  ADD
                </h3>
                {addedTokens.map((token) => (
                  <div 
                    key={`add-prev-${token.id}`} 
                    className="p-3 rounded-lg border border-green-500/50 bg-green-500/10 lg:bg-black/40 lg:border-white/10 lg:backdrop-blur-sm lg:rounded-xl lg:p-5 lg:min-h-[100px] lg:flex lg:flex-col lg:justify-center lg:mb-4"
                  >
                    <h4 className="text-sm sm:text-base font-semibold mb-1 lg:text-2xl lg:font-semibold lg:uppercase">
                      {token.symbol}
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed lg:text-base lg:leading-relaxed lg:m-0 lg:break-words lg:whitespace-pre-wrap">
                      {token.reason || 'No reason provided.'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Footer */}
            <div className="mt-4 pt-4 border-t border-gray-600 flex flex-col sm:flex-row sm:justify-between gap-2 text-xs sm:text-sm text-gray-400 lg:mt-5 lg:pt-5 lg:border-t lg:border-gray-700 lg:text-lg lg:text-gray-500 lg:flex-row">
              <span>
                Analysis by: <span id="handle-preview" className="text-white font-semibold">
                  {twitterHandle || '@your_handle'}
                </span>
              </span>
              <span>Tag @Axis__Solana to participate!</span>
            </div>
            
            {/* Timestamp */}
            <div 
              id="timestamp" 
              className="hidden lg:absolute lg:right-5 lg:bottom-3.5 lg:text-xs lg:text-gray-500 lg:tracking-wide lg:z-10 lg:pointer-events-none lg:select-none" 
              aria-hidden="true"
            ></div>
          </div>
        </div>

        {/* Control Panel */}
        <div className="w-full max-w-[700px] p-4 sm:p-6 bg-base-300/50 border border-white/10 backdrop-blur-xl rounded-2xl lg:w-[calc(100%-4rem)] lg:max-w-[1800px] lg:h-auto lg:flex-none lg:mx-auto lg:mb-8 lg:p-6">
          {/* Mobile Layout */}
          <div className="lg:hidden space-y-8">
            {/* Panel 1: Select Tokens to Remove */}
            <div>
              <h2 className="mb-4 pb-2 text-xl border-b border-gray-600">1. Select Tokens to Remove</h2>
              <motion.div layout className="flex flex-wrap gap-2">
                <AnimatePresence>
                  {constituents.map(symbol => (
                    <motion.div 
                      key={symbol} 
                      layoutId={symbol} 
                      initial={{ opacity: 0, scale: 0.5 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      exit={{ opacity: 0, scale: 0.5 }} 
                      onClick={() => handleRemove(symbol)} 
                      className="px-4 py-2 bg-gray-800 rounded-full cursor-pointer border border-gray-600 hover:bg-gray-700 hover:scale-110 transition-all duration-200" 
                      whileHover={{ scale: 1.1, backgroundColor: '#333' }}
                    >
                      {symbol}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Panel 2: Reason for Removal */}
            <div>
              <h2 className="mb-4 pb-2 text-xl text-red-400 border-b border-gray-600">2. Reason for Removal ({removedTokens.length}/3)</h2>
              <div className="space-y-4">
                <AnimatePresence>
                  {removedTokens.map(token => (
                    <motion.div 
                      key={token.id} 
                      layoutId={token.id} 
                      initial={{ opacity: 0, y: -20 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0, x: -50 }} 
                      className="bg-black/20 p-4 rounded-lg"
                    >
                      <div className="flex justify-between items-center font-semibold mb-2">
                        <span>{token.symbol}</span>
                        <button 
                          onClick={() => handleRevertRemove(token)} 
                          className="bg-none border-none text-gray-400 cursor-pointer p-1 hover:text-white transition-colors"
                        >
                          <FiX />
                        </button>
                      </div>
                      <textarea 
                        placeholder="Your reasoning..." 
                        value={token.reason} 
                        onChange={(e) => handleReasonChange(token.id, e.target.value)} 
                        rows={2} 
                        className="w-full bg-gray-800 border border-gray-600 rounded-md text-white p-2 resize-y focus:border-blue-500 focus:outline-none"
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Panel 3: Add New Tokens */}
            <div>
              <h2 className="mb-4 pb-2 text-xl text-green-400 border-b border-gray-600">3. Add New Tokens ({addedTokens.length}/3)</h2>
              {addedTokens.length < 3 && (
                <div className="flex flex-col sm:flex-row gap-2 mb-4">
                  <input 
                    type="text" 
                    placeholder="Symbol" 
                    value={newTokenSymbol} 
                    onChange={(e) => setNewTokenSymbol(e.target.value)} 
                    maxLength={10} 
                    className="flex-grow bg-gray-800 border border-gray-600 rounded-md text-white p-3 focus:border-green-500 focus:outline-none"
                  />
                  <input 
                    type="text" 
                    placeholder="Reasoning (optional)" 
                    value={newTokenReason} 
                    onChange={(e) => setNewTokenReason(e.target.value)} 
                    className="flex-grow bg-gray-800 border border-gray-600 rounded-md text-white p-3 focus:border-green-500 focus:outline-none"
                  />
                  <button 
                    onClick={handleAddToken} 
                    className="px-4 py-3 bg-green-500 border-none rounded cursor-pointer hover:bg-green-600 transition-colors"
                  >
                    <FiPlus />
                  </button>
                </div>
              )}
              <div className="space-y-4">
                {addedTokens.map(token => (
                  <motion.div 
                    key={token.id} 
                    layout 
                    initial={{ opacity: 0, scale: 0.8 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    exit={{ opacity: 0, scale: 0.5 }} 
                    className="bg-black/20 p-4 rounded-lg"
                  >
                    <div className="flex justify-between items-center font-semibold mb-2">
                      <span>{token.symbol}</span>
                      <button 
                        onClick={() => handleDeleteAdded(token.id)} 
                        className="bg-none border-none text-gray-400 cursor-pointer p-1 hover:text-white transition-colors"
                      >
                        <FiX />
                      </button>
                    </div>
                    <p className="text-sm text-gray-300">{token.reason || 'No reason provided.'}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Panel 4: Finalize & Share */}
            <div className="pt-6 border-t border-gray-600">
              <h2 className="mb-4 pb-2 text-xl border-b border-gray-600">4. Finalize & Share</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Your X Handle</label>
                  <input 
                    type="text" 
                    placeholder="@your_handle" 
                    value={twitterHandle} 
                    onChange={(e) => setTwitterHandle(e.target.value)} 
                    className="w-full bg-gray-800 border border-gray-600 rounded-md text-white p-3 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                
                <button 
                  onClick={startDownloadProcess} 
                  className="w-full flex justify-center items-center gap-3 px-6 py-3 rounded-lg text-white font-bold cursor-pointer border-none bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200" 
                  disabled={isDownloading}
                >
                  <FiDownload />
                  <span>{isDownloading ? 'Generating...' : (isTouchDevice ? 'Generate Image' : 'Download Image')}</span>
                </button>
                
                <p className="text-center text-gray-400 text-sm">
                  {isTouchDevice ? 'Generate image first, then post it!' : 'Download the image and then post it!'}
                </p>
                
                <a 
                  href={shareUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-full flex justify-center items-center gap-3 px-6 py-3 rounded-lg text-white font-bold cursor-pointer border-none bg-[#1DA1F2] hover:bg-[#1a91da] transition-all duration-200"
                >
                  <FaXTwitter />
                  <span>Post on X</span>
                </a>
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:grid lg:grid-cols-4 lg:gap-6">
            {/* Panel 1: Select Tokens to Remove */}
            <div className="flex flex-col gap-4 px-6 border-r border-white/10 overflow-y-auto">
              <h2 className="text-xl font-semibold">1. Select Tokens to Remove</h2>
              <motion.div layout className="flex flex-wrap gap-2">
                <AnimatePresence>
                  {constituents.map(symbol => (
                    <motion.div 
                      key={symbol} 
                      layoutId={symbol} 
                      initial={{ opacity: 0, scale: 0.5 }} 
                      animate={{ opacity: 1, scale: 1 }} 
                      exit={{ opacity: 0, scale: 0.5 }} 
                      onClick={() => handleRemove(symbol)} 
                      className="px-4 py-2 bg-gray-800 rounded-full cursor-pointer border border-gray-600 hover:bg-gray-700 hover:scale-110 transition-all duration-200" 
                      whileHover={{ scale: 1.1, backgroundColor: '#333' }}
                    >
                      {symbol}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Panel 2: Reason for Removal */}
            <div className="flex flex-col gap-4 px-6 border-r border-white/10 overflow-y-auto">
              <h2 className="text-xl font-semibold text-red-400">2. Reason for Removal ({removedTokens.length}/3)</h2>
              <div className="space-y-4">
                <AnimatePresence>
                  {removedTokens.map(token => (
                    <motion.div 
                      key={token.id} 
                      layoutId={token.id} 
                      initial={{ opacity: 0, y: -20 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      exit={{ opacity: 0, x: -50 }} 
                      className="bg-black/20 p-3 rounded-lg"
                    >
                      <div className="flex justify-between items-center font-semibold mb-2">
                        <span>{token.symbol}</span>
                        <button 
                          onClick={() => handleRevertRemove(token)} 
                          className="bg-none border-none text-gray-400 cursor-pointer p-1 hover:text-white transition-colors"
                        >
                          <FiX />
                        </button>
                      </div>
                      <textarea 
                        placeholder="Your reasoning..." 
                        value={token.reason} 
                        onChange={(e) => handleReasonChange(token.id, e.target.value)} 
                        rows={2} 
                        className="w-full bg-gray-800 border border-gray-600 rounded-md text-white p-2 resize-y focus:border-blue-500 focus:outline-none"
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Panel 3: Add New Tokens */}
            <div className="flex flex-col gap-4 px-6 border-r border-white/10 overflow-y-auto">
              <h2 className="text-xl font-semibold text-green-400">3. Add New Tokens ({addedTokens.length}/3)</h2>
              {addedTokens.length < 3 && (
                <div className="flex flex-col gap-2 mb-4">
                  <input 
                    type="text" 
                    placeholder="Symbol" 
                    value={newTokenSymbol} 
                    onChange={(e) => setNewTokenSymbol(e.target.value)} 
                    maxLength={10} 
                    className="w-full bg-gray-800 border border-gray-600 rounded-md text-white p-3 focus:border-green-500 focus:outline-none"
                  />
                  <input 
                    type="text" 
                    placeholder="Reasoning (optional)" 
                    value={newTokenReason} 
                    onChange={(e) => setNewTokenReason(e.target.value)} 
                    className="w-full bg-gray-800 border border-gray-600 rounded-md text-white p-3 focus:border-green-500 focus:outline-none"
                  />
                  <button 
                    onClick={handleAddToken} 
                    className="px-4 py-3 bg-green-500 border-none rounded cursor-pointer hover:bg-green-600 transition-colors"
                  >
                    <FiPlus />
                  </button>
                </div>
              )}
              <div className="space-y-4">
                {addedTokens.map(token => (
                  <motion.div 
                    key={token.id} 
                    layout 
                    initial={{ opacity: 0, scale: 0.8 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    exit={{ opacity: 0, scale: 0.5 }} 
                    className="bg-black/20 p-3 rounded-lg"
                  >
                    <div className="flex justify-between items-center font-semibold mb-2">
                      <span>{token.symbol}</span>
                      <button 
                        onClick={() => handleDeleteAdded(token.id)} 
                        className="bg-none border-none text-gray-400 cursor-pointer p-1 hover:text-white transition-colors"
                      >
                        <FiX />
                      </button>
                    </div>
                    <p className="text-sm text-gray-300">{token.reason || 'No reason provided.'}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Panel 4: Finalize & Share */}
            <div className="flex flex-col gap-4 px-6 overflow-y-auto">
              <h2 className="text-xl font-semibold">4. Finalize & Share</h2>
              <div className="space-y-4 mt-auto">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Your X Handle</label>
                  <input 
                    type="text" 
                    placeholder="@your_handle" 
                    value={twitterHandle} 
                    onChange={(e) => setTwitterHandle(e.target.value)} 
                    className="w-full bg-gray-800 border border-gray-600 rounded-md text-white p-3 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                
                <button 
                  onClick={startDownloadProcess} 
                  className="w-full flex justify-center items-center gap-3 px-6 py-4 rounded-lg text-black font-semibold cursor-pointer border border-white bg-white hover:bg-gray-100 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:-translate-y-0.5" 
                  disabled={isDownloading}
                >
                  <FiDownload />
                  <span>{isDownloading ? 'Generating...' : (isTouchDevice ? 'Generate Image' : 'Download Image')}</span>
                </button>
                
                <p className="text-center text-gray-400 text-sm">
                  {isTouchDevice ? 'Generate image first, then post it!' : 'Download the image and then post it!'}
                </p>
                
                <a 
                  href={shareUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-full flex justify-center items-center gap-3 px-6 py-4 rounded-lg text-white font-semibold cursor-pointer border border-[#1DA1F2] bg-[#1DA1F2] hover:bg-[#1a91da] transition-all duration-200 shadow-lg hover:-translate-y-0.5"
                >
                  <FaXTwitter />
                  <span>Post on X</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ChallengePage