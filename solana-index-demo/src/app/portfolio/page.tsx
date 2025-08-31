/* =====================================================
 * app/portfolio/page.tsx ― Portfolio page
 * ===================================================== */

import PortfolioClient from './PortfolioClient'

export const metadata = {
  title: 'Portfolio - Axis Index',
  description: 'View your portfolio performance and token allocations.',
}

export default async function PortfolioPage() {
  return <PortfolioClient />
}
