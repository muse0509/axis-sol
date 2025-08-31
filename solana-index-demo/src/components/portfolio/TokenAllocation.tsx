'use client';

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

interface TokenAllocationProps {
  tokens: TokenData[]
}

const TokenAllocation = ({ tokens }: TokenAllocationProps) => {
  const formatCurrency = (value: number) => {
    if (value >= 1e9) {
      return `$${(value / 1e9).toFixed(1)}B`
    } else if (value >= 1e6) {
      return `$${(value / 1e6).toFixed(1)}M`
    } else if (value >= 1e3) {
      return `$${(value / 1e3).toFixed(1)}K`
    }
    return `$${value.toFixed(2)}`
  }

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    } else if (price >= 1) {
      return `$${price.toFixed(2)}`
    } else {
      return `$${price.toFixed(4)}`
    }
  }

  return (
    <div className="w-full bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800">
      <h3 className="text-xl font-bold text-white mb-6">Token Allocation Details</h3>
      
      <div className="space-y-4 max-h-80 overflow-y-auto">
        {tokens.map((token, index) => (
          <div 
            key={token.symbol}
            className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-white">{token.symbol}</span>
              </div>
              <div>
                <h4 className="font-semibold text-white">{token.name}</h4>
                <p className="text-sm text-gray-400">{token.allocation.toFixed(1)}%</p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="font-semibold text-white">{formatPrice(token.currentPrice)}</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${token.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    24h: {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(1)}%
                  </span>
                  <div className={`w-2 h-2 rounded-full ${token.change24h >= 0 ? 'bg-green-400' : 'bg-red-400'}`} />
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${token.changeSinceMint >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                    Since mint: {token.changeSinceMint >= 0 ? '+' : ''}{token.changeSinceMint.toFixed(1)}%
                  </span>
                  <div className={`w-2 h-2 rounded-full ${token.changeSinceMint >= 0 ? 'bg-blue-400' : 'bg-red-400'}`} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400">Total Tokens</p>
            <p className="text-white font-semibold">{tokens.length}</p>
          </div>
          <div>
            <p className="text-gray-400">Equal Weight</p>
            <p className="text-white font-semibold">{(100 / tokens.length).toFixed(1)}%</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TokenAllocation
