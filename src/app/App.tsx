import { AppProviders } from '@/app/providers/AppProviders'
import { PortfolioPage } from '@/features/portfolio-page/PortfolioPage'

export default function App() {
  return (
    <AppProviders>
      <PortfolioPage />
    </AppProviders>
  )
}
