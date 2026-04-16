import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Spotlight } from '@/shared/components/ui/spotlight'
import { SplineScene } from '@/shared/components/ui/SplineScene'
import { useTranslation } from '@/features/localization/LanguageContext'
import { ChevronDown } from 'lucide-react'

const HERO_SCENE_URL = 'https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode'
const HERO_INTRO_KEY = 'hero-robot-intro-played'
const HERO_INTRO_DURATION = 2

export function HeroSection() {
  const { lang, t } = useTranslation()
  const prefersReducedMotion = useReducedMotion()
  const [showIntro, setShowIntro] = useState(false)
  const [enableHeroSpline, setEnableHeroSpline] = useState(false)

  useEffect(() => {
    if (prefersReducedMotion) return
    if (typeof window === 'undefined') return

    const enable = () => setEnableHeroSpline(true)

    const timeoutId = window.setTimeout(enable, 1000)
    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [prefersReducedMotion])

  useEffect(() => {
    if (prefersReducedMotion) return
    if (typeof window === 'undefined') return
    if (window.innerWidth < 1024) return
    if (window.sessionStorage.getItem(HERO_INTRO_KEY) === '1') return

    window.sessionStorage.setItem(HERO_INTRO_KEY, '1')
    const frame = window.requestAnimationFrame(() => {
      setShowIntro(true)
    })

    return () => {
      window.cancelAnimationFrame(frame)
    }
  }, [prefersReducedMotion])

  useEffect(() => {
    if (!showIntro) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [showIntro])

  return (
    <div id="about" className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center pt-20">
      {showIntro ? (
        <motion.div
          initial={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            borderRadius: '0rem',
            opacity: 1,
          }}
          animate={{
            top: '6rem',
            left: '50%',
            x: '-50%',
            width: 'min(100vw - 3rem, 80rem)',
            height: 'clamp(22rem, 54vh, 34rem)',
            borderRadius: '2rem',
            opacity: 1,
          }}
          transition={{
            duration: HERO_INTRO_DURATION,
            ease: [0.16, 1, 0.3, 1],
          }}
          onAnimationComplete={() => setShowIntro(false)}
          className="pointer-events-none z-[1300] overflow-hidden bg-[#020205] shadow-[0_40px_120px_rgba(0,0,0,0.65)]"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30" />
          <SplineScene scene={HERO_SCENE_URL} className="relative z-10 h-full w-full" />
        </motion.div>
      ) : null}

      {/* Background Spotlight */}
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />

      {/* ── Vertical Name Sidebar (Desktop Only) ── */}
      <div className="hidden lg:block fixed right-8 top-1/2 -translate-y-1/2 z-[50]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-px h-24 bg-gradient-to-b from-transparent to-white/20" />
          <span 
            className="text-[10px] font-mono tracking-[0.5em] uppercase text-white/20 hover:text-white/60 transition-colors cursor-default"
            style={{ writingMode: 'vertical-rl' }}
          >
            Hüseyin Emre
          </span>
          <div className="w-px h-24 bg-gradient-to-t from-transparent to-white/20" />
        </div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 flex flex-col items-center">
        
        {/* ── 1. The Focal Robot (Spline) ── */}
        <motion.div
          initial={{ opacity: showIntro ? 0 : 0, scale: showIntro ? 0.92 : 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 1.2,
            ease: 'easeOut',
            delay: showIntro ? 0.15 : 0,
          }}
          className="relative mb-8 h-[350px] w-full md:h-[500px]"
        >
          {enableHeroSpline ? (
            <SplineScene
              scene={HERO_SCENE_URL}
              className="w-full h-full relative z-10"
            />
          ) : (
            <div className="w-full h-full relative z-10 rounded-[2rem] bg-[radial-gradient(circle_at_20%_0%,rgba(56,189,248,0.4),transparent_55%),radial-gradient(circle_at_80%_100%,rgba(129,140,248,0.5),transparent_55%)]" />
          )}
        </motion.div>

        {/* ── 2. Centered Content ── */}
        <div className="flex flex-col items-center text-center max-w-3xl">
          {/* Role badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: showIntro ? 1.45 : 0.5 }}
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
            transition={{ delay: showIntro ? 1.6 : 0.7 }}
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
            transition={{ delay: showIntro ? 1.75 : 0.9 }}
            className="text-white/50 text-base md:text-lg mb-10 max-w-xl mx-auto leading-relaxed font-light"
          >
            {t('hero-desc')}
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: showIntro ? 1.9 : 1.1 }}
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
            transition={{ delay: showIntro ? 2 : 1.2 }}
            href="#coursework"
            className="text-sm text-cyan-400/70 hover:text-cyan-300 underline-offset-4 hover:underline mb-4"
          >
            {t('hero-coursework-link')}
          </motion.a>

          {/* Stats row (Condensed) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: showIntro ? 2.05 : 1.3 }}
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
        transition={{ delay: showIntro ? 2.2 : 2, duration: 1 }}
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
