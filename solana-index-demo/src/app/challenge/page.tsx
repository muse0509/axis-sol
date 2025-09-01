'use client';
import type { NextPage } from 'next'
import Head from 'next/head'
import { useCallback, useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiDownload, FiPlus, FiX } from 'react-icons/fi'
import { FaXTwitter } from 'react-icons/fa6'
import { CURRENT_CONSTITUENTS } from '../../lib/constituents'
import { PageLayout, ModernCard, ModernButton, GridLayout } from '../../components/common'

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
        className="relative bg-gray-800 p-8 pt-10 rounded-2xl flex flex-col items-center gap-4 max-w-full max-h-[90vh] border border-gray-700/30"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-2.5 right-2.5 bg-transparent border-none text-white text-2xl cursor-pointer z-10 hover:text-gray-400 transition-colors"><FiX /></button>
        <img src={imageUrl} alt="Generated Challenge Preview" className="max-w-full max-h-[70vh] object-contain rounded-lg" />
        <p className="text-gray-400 text-center text-sm">
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
    setIsPreparing(true);
    setTimeout(() => {
      setIsPreparing(false);
      setIsDownloading(true);
      generateAndDownloadImage();
    }, 1000);
  };

  const generateAndDownloadImage = async () => {
    if (!previewRef.current) return;
    
    try {
      // Dynamically import html2canvas to avoid SSR issues
      const html2canvas = (await import('html2canvas')).default;
      
      // Temporarily show the preview element for html2canvas
      const previewElement = previewRef.current;
      const originalDisplay = previewElement.style.display;
      const originalPosition = previewElement.style.position;
      const originalLeft = previewElement.style.left;
      const originalTop = previewElement.style.top;
      const originalVisibility = previewElement.style.visibility;
      const originalZIndex = previewElement.style.zIndex;
      
      // Make element visible but off-screen for html2canvas
      previewElement.style.display = 'block';
      previewElement.style.position = 'absolute';
      previewElement.style.left = '-9999px';
      previewElement.style.top = '-9999px';
      previewElement.style.visibility = 'visible';
      previewElement.style.zIndex = '-1';
      
      // Wait a bit for the element to be properly positioned
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const canvas = await html2canvas(previewElement, {
        backgroundColor: '#000000',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        width: 400,
        height: 600,
        scrollX: 0,
        scrollY: 0,
        logging: false,
        foreignObjectRendering: false,
        ignoreElements: (element) => {
          // Ignore any elements that might cause issues
          const htmlElement = element as HTMLElement;
          return htmlElement.classList.contains('hidden') || htmlElement.style.display === 'none';
        },
        onclone: (clonedDoc) => {
          // Fix unsupported color functions in the cloned document
          const style = clonedDoc.createElement('style');
          style.textContent = `
            * {
              color: inherit !important;
              background-color: inherit !important;
              border-color: inherit !important;
            }
            .bg-black { background-color: #000000 !important; }
            .text-white { color: #ffffff !important; }
            .text-gray-400 { color: #9ca3af !important; }
            .text-gray-300 { color: #d1d5db !important; }
            .text-red-400 { color: #f87171 !important; }
            .text-green-400 { color: #4ade80 !important; }
            .bg-red-500\\/10 { background-color: rgba(239, 68, 68, 0.1) !important; }
            .bg-green-500\\/10 { background-color: rgba(34, 197, 94, 0.1) !important; }
            .border-red-500\\/20 { border-color: rgba(239, 68, 68, 0.2) !important; }
            .border-green-500\\/20 { border-color: rgba(34, 197, 94, 0.2) !important; }
            .border-gray-700\\/30 { border-color: rgba(55, 65, 81, 0.3) !important; }
          `;
          clonedDoc.head.appendChild(style);
        }
      });
      
      // Restore original styles
      previewElement.style.display = originalDisplay;
      previewElement.style.position = originalPosition;
      previewElement.style.left = originalLeft;
      previewElement.style.top = originalTop;
      previewElement.style.visibility = originalVisibility;
      previewElement.style.zIndex = originalZIndex;
      
      const imageUrl = canvas.toDataURL('image/png');
      setGeneratedImageUrl(imageUrl);
      
      // Auto-download
      const link = document.createElement('a');
      link.download = `axis-challenge-${Date.now()}.png`;
      link.href = imageUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setIsDownloading(false);
    } catch (error) {
      console.error('Error generating image:', error);
      setIsDownloading(false);
      
      // More specific error messages
      if (error instanceof Error) {
        if (error.message.includes('canvas')) {
          alert('Canvas rendering failed. Please try again or refresh the page.');
        } else if (error.message.includes('CORS')) {
          alert('Image generation failed due to security restrictions. Please try again.');
        } else if (error.message.includes('oklab') || error.message.includes('color function')) {
          alert('Color parsing error detected. Please try again - this has been fixed.');
        } else {
          alert(`Error generating image: ${error.message}`);
        }
      } else {
        alert('Error generating image. Please try again.');
      }
    }
  };

  return (
    <>
      <Head>
        <title>Axis Index Challenge - Customize Your Index</title>
        <meta name="description" content="Challenge the current Axis Index composition. Remove up to 3 tokens and add up to 3 new ones with your reasoning." />
      </Head>

      <PageLayout 
        title="Axis Index Challenge"
        description="Challenge the current index composition. Remove up to 3 tokens and add up to 3 new ones with your reasoning."
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Challenge Rules */}
          <ModernCard className="p-8" gradient>
            <h2 className="text-2xl font-bold text-white mb-4 text-center">Challenge Rules</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-orange-400 mb-2">3</div>
                <div className="text-gray-300">Remove up to 3 tokens</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-400 mb-2">3</div>
                <div className="text-gray-300">Add up to 3 new tokens</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-400 mb-2">∞</div>
                <div className="text-gray-300">Unlimited creativity</div>
              </div>
            </div>
          </ModernCard>

          {/* Current Constituents */}
          <ModernCard className="p-8" dark>
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Current Index Constituents</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {constituents.map((symbol) => (
                <motion.button
                  key={symbol}
                  onClick={() => handleRemove(symbol)}
                  className="p-4 bg-gray-800/30 rounded-xl border border-gray-700/30 hover:bg-gray-700/30 transition-all duration-200 hover:scale-105"
                  whileHover={{ y: -2 }}
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{symbol}</div>
                    <div className="text-xs text-gray-400">Click to remove</div>
                  </div>
                </motion.button>
              ))}
            </div>
          </ModernCard>

          {/* Removed Tokens */}
          {removedTokens.length > 0 && (
            <ModernCard className="p-8" dark>
              <h2 className="text-2xl font-bold text-white mb-6 text-center">Removed Tokens</h2>
              <GridLayout cols={3} gap="md">
                {removedTokens.map((token) => (
                  <div key={token.id} className="p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                    <div className="text-center mb-3">
                      <div className="text-xl font-bold text-red-400">{token.symbol}</div>
                    </div>
                    <textarea
                      value={token.reason}
                      onChange={(e) => handleReasonChange(token.id, e.target.value)}
                      placeholder="Why did you remove this token?"
                      className="w-full p-2 bg-gray-800/30 rounded-lg border border-gray-700/30 text-white text-sm resize-none placeholder-gray-400"
                      rows={3}
                    />
                    <div className="mt-3 text-center">
                      <ModernButton
                        variant="outline"
                        size="sm"
                        onClick={() => handleRevertRemove(token)}
                        className="w-full"
                      >
                        Revert
                      </ModernButton>
                    </div>
                  </div>
                ))}
              </GridLayout>
            </ModernCard>
          )}

          {/* Add New Tokens */}
          <ModernCard className="p-8" dark>
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Add New Tokens</h2>
            <div className="max-w-md mx-auto space-y-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newTokenSymbol}
                  onChange={(e) => setNewTokenSymbol(e.target.value)}
                  placeholder="Token Symbol (e.g., BTC)"
                  className="flex-1 p-3 bg-gray-800/30 rounded-lg border border-gray-700/30 text-white placeholder-gray-400"
                />
                <ModernButton
                  variant="primary"
                  size="sm"
                  onClick={handleAddToken}
                  disabled={!newTokenSymbol.trim() || addedTokens.length >= 3}
                >
                  <FiPlus />
                  Add
                </ModernButton>
              </div>
              <textarea
                value={newTokenReason}
                onChange={(e) => setNewTokenReason(e.target.value)}
                placeholder="Why should this token be added to the index?"
                className="w-full p-3 bg-gray-800/30 rounded-lg border border-gray-700/30 text-white placeholder-gray-400 resize-none"
                rows={3}
              />
            </div>
          </ModernCard>

          {/* Added Tokens */}
          {addedTokens.length > 0 && (
            <ModernCard className="p-8" dark>
              <h2 className="text-2xl font-bold text-white mb-6 text-center">Added Tokens</h2>
              <GridLayout cols={3} gap="md">
                {addedTokens.map((token) => (
                  <div key={token.id} className="p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                    <div className="text-center mb-3">
                      <div className="text-xl font-bold text-green-400">{token.symbol}</div>
                    </div>
                    <div className="text-sm text-gray-300 mb-3">{token.reason}</div>
                    <div className="text-center">
                      <ModernButton
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAdded(token.id)}
                        className="w-full"
                      >
                        Remove
                      </ModernButton>
                    </div>
                  </div>
                ))}
              </GridLayout>
            </ModernCard>
          )}

          {/* Twitter Handle */}
          <ModernCard className="p-8" dark>
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Share Your Challenge</h2>
            <div className="max-w-md mx-auto space-y-4">
              <div className="flex items-center space-x-2">
                <FaXTwitter className="text-blue-400 text-xl" />
                <input
                  type="text"
                  value={twitterHandle}
                  onChange={(e) => setTwitterHandle(e.target.value)}
                  placeholder="@your_handle"
                  className="flex-1 p-3 bg-gray-800/30 rounded-lg border border-gray-700/30 text-white placeholder-gray-400"
                />
              </div>
              <div className="text-center text-sm text-gray-400">
                Your Twitter handle will be included in the generated image
              </div>
            </div>
          </ModernCard>

          {/* Generate Challenge */}
          <div className="text-center">
            <ModernButton
              variant="primary"
              size="lg"
              gradient
              onClick={startDownloadProcess}
              loading={isDownloading || isPreparing}
              disabled={removedTokens.length === 0 && addedTokens.length === 0}
            >
              {isPreparing ? 'Preparing...' : isDownloading ? 'Generating...' : 'Generate Challenge Image'}
            </ModernButton>
          </div>

          {/* Preview */}
          <div 
            ref={previewRef} 
            className="fixed -left-[9999px] -top-[9999px] opacity-0 pointer-events-none"
            style={{ visibility: 'hidden' }}
          >
            <div className="bg-black text-white p-8 rounded-2xl max-w-md mx-auto border border-gray-700/30">
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-white mb-2">Axis Index Challenge</h1>
                <p className="text-gray-400">By {twitterHandle}</p>
              </div>
              
              {removedTokens.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-red-400 mb-3">Removed Tokens</h2>
                  <div className="space-y-2">
                    {removedTokens.map((token) => (
                      <div key={token.id} className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                        <div className="font-bold text-red-400">{token.symbol}</div>
                        {token.reason && <div className="text-sm text-gray-300">{token.reason}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {addedTokens.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-green-400 mb-3">Added Tokens</h2>
                  <div className="space-y-2">
                    {addedTokens.map((token) => (
                      <div key={token.id} className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                        <div className="font-bold text-green-400">{token.symbol}</div>
                        <div className="text-sm text-gray-300">{token.reason}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="text-center text-sm text-gray-400">
                Generated on {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </PageLayout>

      <AnimatePresence>
        {generatedImageUrl && (
          <ImagePreviewModal
            imageUrl={generatedImageUrl}
            onClose={() => setGeneratedImageUrl(null)}
          />
        )}
      </AnimatePresence>
    </>
  )
}

export default ChallengePage