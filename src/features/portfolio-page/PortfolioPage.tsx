import { motion } from 'framer-motion'
import { useAdaptive } from '@/features/personalization/state/AdaptiveLayoutContext'
import { Background } from '@/features/portfolio-page/ui/Background'
import { PortfolioNavigationBar } from '@/features/portfolio-page/ui/PortfolioNavigationBar'
import { portfolioSectionComponents } from '@/features/portfolio-page/sectionRegistry'
import { CookieConsentBanner } from '@/features/compliance/CookieConsentBanner'
import { LegalDialogs } from '@/features/compliance/LegalDialogs'
import { GoogleFontLoader } from '@/features/compliance/GoogleFontLoader'
import { CinematicFooter } from '@/components/ui/motion-footer'

const SECTION_REVEAL_TRANSITION = {
  duration: 0.8,
  ease: [0.16, 1, 0.3, 1] as const,
}

export function PortfolioPage() {
  const { sectionOrder } = useAdaptive()

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <GoogleFontLoader />
      <PortfolioNavigationBar />
      <CookieConsentBanner />
      <LegalDialogs />

      <div className="relative z-10 min-h-[100vh] rounded-b-[2rem] border-b border-white/10 bg-[#020205] shadow-[0_28px_100px_rgba(0,0,0,0.55)]">
        <main>
          {sectionOrder.map((sectionId) => {
            const Section = portfolioSectionComponents[sectionId]

            return (
              <motion.div
                key={sectionId}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={SECTION_REVEAL_TRANSITION}
              >
                <Section />
              </motion.div>
            )
          })}
        </main>

        <Background />
      </div>

      <CinematicFooter />
    </div>
  )
}
