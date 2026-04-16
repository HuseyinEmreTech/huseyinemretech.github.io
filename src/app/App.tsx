import { useEffect, useState } from 'react'
import { AppProviders } from '@/app/providers/AppProviders'
import { PortfolioPage } from '@/features/portfolio-page/PortfolioPage'

function AppLoadingOverlay() {
  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-[#020205]">
      <div className="relative flex flex-col items-center gap-4">
        <div className="h-14 w-14 rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-400/30 via-sky-500/10 to-indigo-500/40 shadow-[0_0_60px_rgba(56,189,248,0.45)] animate-pulse" />
        <div className="text-center space-y-1">
          <p className="text-xs font-mono uppercase tracking-[0.35em] text-white/40">
            Portfolio yükleniyor
          </p>
          <p className="text-[11px] text-white/30">
            ERP &amp; .NET deneyimi hazırlanıyor...
          </p>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [bootstrapped, setBootstrapped] = useState(false)

  useEffect(() => {
    const id = window.setTimeout(() => setBootstrapped(true), 700)
    return () => window.clearTimeout(id)
  }, [])

  return (
    <AppProviders>
      {!bootstrapped && <AppLoadingOverlay />}
      <PortfolioPage />
    </AppProviders>
  )
}
