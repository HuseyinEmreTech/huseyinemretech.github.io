import { Suspense, lazy, useEffect } from 'react'
import { useAdaptive } from '@/features/personalization/state/AdaptiveLayoutContext'
import { PortfolioNavigationBar } from '@/features/portfolio-page/ui/PortfolioNavigationBar'
import { portfolioSectionComponents } from '@/features/portfolio-page/sectionRegistry'
import { CookieConsentBanner } from '@/features/compliance/CookieConsentBanner'
import { LegalDialogs } from '@/features/compliance/LegalDialogs'
import { GoogleFontLoader } from '@/features/compliance/GoogleFontLoader'
import { PageLoader } from '@/shared/components/ui/PageLoader'

const Background = lazy(() =>
  import('@/features/portfolio-page/ui/Background').then((m) => ({ default: m.Background })),
)

const CinematicFooter = lazy(() =>
  import('@/shared/components/ui/motion-footer').then((m) => ({ default: m.CinematicFooter })),
)

export function PortfolioPage() {
  const { sectionOrder } = useAdaptive()

  useEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration

    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }

    // URL'de hash varsa (ör. /#projects) o bölüme scroll et; yoksa başa git
    const initialHash = window.location.hash.slice(1)
    let timerId: ReturnType<typeof setTimeout> | undefined

    if (initialHash) {
      // PageLoader + React render için yeterince bekle (loader min ~600ms)
      timerId = setTimeout(() => {
        document.getElementById(initialHash)?.scrollIntoView({ behavior: 'smooth' })
      }, 750)
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    }

    return () => {
      clearTimeout(timerId)
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = previousScrollRestoration
      }
    }
  }, [])

  // Navbar hash linklerine tıklandığında smooth scroll
  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.slice(1)
      if (!hash) return
      requestAnimationFrame(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' })
      })
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <PageLoader />
      <GoogleFontLoader />
      <PortfolioNavigationBar />
      <CookieConsentBanner />
      <LegalDialogs />

      <div className="relative min-h-[100vh] rounded-b-[2rem] border-b border-white/10 bg-[#020205] shadow-[0_28px_100px_rgba(0,0,0,0.55)]">
        <main>
          {sectionOrder.map((sectionId) => {
            const Section = portfolioSectionComponents[sectionId]
            return <Section key={sectionId} />
          })}
        </main>

        <Suspense fallback={null}>
          <Background />
        </Suspense>
      </div>

      <Suspense fallback={null}>
        <CinematicFooter />
      </Suspense>
    </div>
  )
}
