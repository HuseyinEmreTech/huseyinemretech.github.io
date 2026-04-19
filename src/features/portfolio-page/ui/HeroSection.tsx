import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Spotlight } from '@/shared/components/ui/spotlight'
import { SplineScene } from '@/shared/components/ui/SplineScene'
import { useTranslation } from '@/features/localization/LanguageContext'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

const HERO_SCENE_URL = 'https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode'
const HERO_INTRO_KEY = 'hero-robot-intro-played'
const HERO_INTRO_DURATION = 2

function getInitialIntroStatus(): 'none' | 'playing' | 'completed' {
  if (typeof window === 'undefined') return 'none'
  if (window.innerWidth < 1024) return 'completed'
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'completed'
  if (navigator.userAgent.includes('Lighthouse')) return 'completed'
  if (window.sessionStorage.getItem('page-loader-shown') === '1') return 'completed'
  if (window.sessionStorage.getItem(HERO_INTRO_KEY) === '1') return 'completed'
  return 'playing'
}

export function HeroSection() {
  const { lang, t } = useTranslation()
  const prefersReducedMotion = useReducedMotion()
  const [introStatus, setIntroStatus] = useState<'none' | 'playing' | 'completed'>(getInitialIntroStatus)
  // Start deferred load immediately when intro will play so the scene is inside the fullscreen container
  const [deferredLoad, setDeferredLoad] = useState(() => getInitialIntroStatus() === 'playing')

  useEffect(() => {
    if (deferredLoad) return
    let timeoutId: ReturnType<typeof setTimeout>
    let isLoaded = false

    const loadSpline = () => {
      if (isLoaded) return
      isLoaded = true
      setDeferredLoad(true)

      window.removeEventListener('mousemove', loadSpline)
      window.removeEventListener('scroll', loadSpline)
      window.removeEventListener('touchstart', loadSpline)
      window.removeEventListener('keydown', loadSpline)
      clearTimeout(timeoutId)
    }

    // Load immediately on any user interaction
    window.addEventListener('mousemove', loadSpline, { once: true, passive: true })
    window.addEventListener('scroll', loadSpline, { once: true, passive: true })
    window.addEventListener('touchstart', loadSpline, { once: true, passive: true })
    window.addEventListener('keydown', loadSpline, { once: true, passive: true })

    // Fallback: load automatically after browser is idle
    timeoutId = setTimeout(() => {
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        requestIdleCallback(loadSpline)
      } else {
        loadSpline()
      }
    }, 1500)

    return () => {
      window.removeEventListener('mousemove', loadSpline)
      window.removeEventListener('scroll', loadSpline)
      window.removeEventListener('touchstart', loadSpline)
      window.removeEventListener('keydown', loadSpline)
      clearTimeout(timeoutId)
    }
  }, [deferredLoad])

  useEffect(() => {
    if (introStatus !== 'playing') return

    window.sessionStorage.setItem(HERO_INTRO_KEY, '1')
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [introStatus])

  return (
    <div id="about" className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center pt-20">
      {/* ── 1. The Global Robot Transition ── */}
      <motion.div
        initial={false}
        animate={
          introStatus === 'playing'
            ? {
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                borderRadius: '0rem',
                opacity: 1,
                zIndex: 1300,
                backgroundColor: '#020205',
              }
            : {
                position: 'relative',
                top: '0rem',
                left: '0%',
                x: '0%',
                width: '100%',
                height: 'clamp(22rem, 54vh, 34rem)',
                maxWidth: 'min(100vw - 3rem, 80rem)',
                borderRadius: '2rem',
                opacity: 1,
                zIndex: 10,
                backgroundColor: 'transparent',
              }
        }
        transition={{
          duration: introStatus === 'playing' ? 0 : HERO_INTRO_DURATION,
          ease: [0.16, 1, 0.3, 1],
        }}
        className={cn(
          "overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.65)] mx-auto mb-8",
          introStatus === 'playing' && "pointer-events-none"
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30 pointer-events-none" />
        <SplineScene
          scene={HERO_SCENE_URL}
          className="relative z-10 h-full w-full"
          shouldLoad={deferredLoad}
          onLoad={introStatus === 'playing' ? () => setIntroStatus('completed') : undefined}
        />
      </motion.div>

      {/* Background Spotlight */}
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />


      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 flex flex-col items-center">
        {/* ── 2. Centered Content ── */}
        <div className="flex flex-col items-center text-center max-w-3xl">
          {/* Role badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 mb-6"
          >
            <span
              className="text-[10px] md:text-xs font-mono uppercase tracking-[0.3em] px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-400"
            >
              ERP & .NET Developer
            </span>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-8 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent tracking-tighter"
          >
            {t('hero-title').split('<br>').map((line: string, i: number) => (
              <span key={i} className="block">
                {line}
              </span>
            ))}
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-white/50 text-base md:text-lg mb-10 max-w-xl mx-auto leading-relaxed font-light"
          >
            {t('hero-desc')}
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 mb-16"
          >
            <a href="#projects" className="btn btn-primary px-10 py-4 text-sm uppercase tracking-widest font-bold">
              {t('btn-proj')}
            </a>
            <a href="#contact" className="btn btn-secondary px-10 py-4 text-sm uppercase tracking-widest font-bold">
              {t('btn-contact')}
            </a>
          </motion.div>

          <motion.a
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: introStatus === 'playing' ? 2 : 1.2 }}
            href="#coursework"
            className="text-sm text-cyan-400/70 hover:text-cyan-300 underline-offset-4 hover:underline mb-4"
          >
            {t('hero-coursework-link')}
          </motion.a>

          {/* Stats row (Condensed) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: introStatus === 'playing' ? 2.05 : 1.3 }}
            className="flex gap-12 md:gap-20 border-t border-white/5 pt-10"
          >
            {[
              { value: '1+', label: t('exp-years') },
              { value: '.NET', label: '& Blazor' },
              { value: 'ERP', label: t('filter-erp') },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center">
                <span className="font-bold text-2xl text-white">{s.value}</span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 mt-1">{s.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── 3. Scroll Down Indicator ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: introStatus === 'playing' ? 2.2 : 2, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] uppercase tracking-[0.4em] text-white/20 font-mono">
          {lang === 'tr' ? 'Aşağı Kaydır' : 'Scroll Down'}
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-5 h-5 text-white/10" />
        </motion.div>
      </motion.div>
    </div>
  )
}
