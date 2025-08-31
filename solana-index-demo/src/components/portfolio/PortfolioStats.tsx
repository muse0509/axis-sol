'use client';

interface PortfolioStatsProps {
  totalValue: number
  totalChange: number
  mintDate: string
}

const PortfolioStats = ({ totalValue, totalChange, mintDate }: PortfolioStatsProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="w-full bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center">
          <h3 className="text-gray-400 text-sm font-medium mb-2">Total Portfolio Value</h3>
          <p className="text-3xl font-bold text-white">{formatCurrency(totalValue)}</p>
        </div>
        
        <div className="text-center">
          <h3 className="text-gray-400 text-sm font-medium mb-2">Total Change</h3>
          <div className="flex items-center justify-center gap-2">
            <span className={`text-2xl font-bold ${totalChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalChange >= 0 ? '+' : ''}{totalChange.toFixed(2)}%
            </span>
            <div className={`w-3 h-3 rounded-full ${totalChange >= 0 ? 'bg-green-400' : 'bg-red-400'}`} />
          </div>
        </div>
        
        <div className="text-center">
          <h3 className="text-gray-400 text-sm font-medium mb-2">Mint Date</h3>
          <p className="text-xl font-semibold text-white">{formatDate(mintDate)}</p>
        </div>
      </div>
    </div>
  )
}

export default PortfolioStats
