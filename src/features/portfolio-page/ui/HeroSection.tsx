import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion'
import { Spotlight } from '@/shared/components/ui/spotlight'
import { SplineScene } from '@/shared/components/ui/SplineScene'
import { useTranslation } from '@/features/localization/LanguageContext'
import { ChevronDown } from 'lucide-react'

const HERO_SCENE_URL = 'https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode'

export function HeroSection() {
  const { lang, t } = useTranslation()
  const prefersReducedMotion = useReducedMotion()

  // ── Mouse tracking ──────────────────────────────────────────
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)

  // Yüksek stiffness + damping → daha az frame hesabı, yine de akıcı
  const smoothX = useSpring(rawX, { stiffness: 60, damping: 20 })
  const smoothY = useSpring(rawY, { stiffness: 60, damping: 20 })

  // -0.5…0.5 → hafif 3D tilt (geniş ekranda ±7°, dikey ±4°)
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-7, 7])
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [4, -4])

  const onMouseMove = useCallback((e: MouseEvent) => {
    rawX.set((e.clientX / window.innerWidth) - 0.5)
    rawY.set((e.clientY / window.innerHeight) - 0.5)
  }, [rawX, rawY])

  useEffect(() => {
    if (prefersReducedMotion) return
    window.addEventListener('mousemove', onMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMouseMove)
  }, [prefersReducedMotion, onMouseMove])

  // ── Spline deferred loading ──────────────────────────────────
  // ~4MB Spline bundle'ı kritik yol bitmeden indirmemeye başla.
  // Yavaş / veri tasarruflu bağlantıda hiç yükleme.
  const [splineReady, setSplineReady] = useState(false)
  useEffect(() => {
    type NavConn = { saveData?: boolean; effectiveType?: string }
    const conn = (navigator as Navigator & { connection?: NavConn }).connection
    if (conn?.saveData || conn?.effectiveType === '2g' || conn?.effectiveType === 'slow-2g') return

    const start = () => setSplineReady(true)
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(start, { timeout: 3000 })
      return () => window.cancelIdleCallback(id)
    }
    const id = setTimeout(start, 2500)
    return () => clearTimeout(id)
  }, [])

  // ── PageLoader koordinasyonu ─────────────────────────────────
  // robot:settled → PageLoader kapanır. Sadece bir kez ateşlenir.
  const robotSettledFiredRef = useRef(false)
  const fireRobotSettled = useCallback(() => {
    if (robotSettledFiredRef.current) return
    robotSettledFiredRef.current = true
    window.dispatchEvent(new Event('robot:settled'))
  }, [])

  useEffect(() => {
    type NavConn = { saveData?: boolean; effectiveType?: string }
    const conn = (navigator as Navigator & { connection?: NavConn }).connection
    const isSlowConn = conn?.saveData ?? (conn?.effectiveType === '2g' || conn?.effectiveType === 'slow-2g')

    if (isSlowConn) {
      // Spline hiç yüklenmeyecek; loader'ı kısa sürede serbest bırak
      const id = setTimeout(fireRobotSettled, 500)
      return () => clearTimeout(id)
    }

    if (!splineReady) return // idle callback bekleniyor; onLoad veya timeout halleder

    // Spline yükleniyor — onLoad tetiklenmezse 5s sonra fallback (CDN engelinde hızlı geçiş)
    const id = setTimeout(fireRobotSettled, 5000)
    return () => clearTimeout(id)
  }, [splineReady, fireRobotSettled])

  return (
    <div id="about" className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center pt-20">

      {/* ── Robot — mouse'u takip eden 3D tilt container ── */}
      <motion.div
        style={{
          rotateX: prefersReducedMotion ? 0 : rotateX,
          rotateY: prefersReducedMotion ? 0 : rotateY,
          transformPerspective: 1200,
        }}
        className="relative w-full h-[clamp(22rem,54vh,34rem)] max-w-[min(calc(100vw-3rem),80rem)] overflow-hidden rounded-[2rem] shadow-[0_40px_120px_rgba(0,0,0,0.65)] mx-auto mb-8 z-10"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30 pointer-events-none z-20" />
        <SplineScene
          scene={HERO_SCENE_URL}
          shouldLoad={splineReady}
          onLoad={fireRobotSettled}
          onError={fireRobotSettled}
          className="relative z-10 h-full w-full"
        />
      </motion.div>

      {/* Background Spotlight */}
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 flex flex-col items-center">
        {/* ── İçerik ── */}
        <div className="flex flex-col items-center text-center max-w-3xl">
          {/* Role badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 mb-6"
          >
            <span className="text-[10px] md:text-xs font-mono uppercase tracking-[0.3em] px-4 py-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/5 text-cyan-400">
              ERP & .NET Developer
            </span>
          </motion.div>

          {/* Başlık */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-8 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent tracking-tighter"
          >
            {t('hero-title').split('<br>').map((line: string, i: number) => (
              <span key={i} className="block">{line}</span>
            ))}
          </motion.h1>

          {/* Açıklama */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-white/50 text-base md:text-lg mb-10 max-w-xl mx-auto leading-relaxed font-light"
          >
            {t('hero-desc')}
          </motion.p>

          {/* Butonlar */}
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
            transition={{ delay: 1.2 }}
            href="#coursework"
            className="text-sm text-cyan-400/70 hover:text-cyan-400 underline-offset-4 hover:underline mb-4"
          >
            {t('hero-coursework-link')}
          </motion.a>

          {/* İstatistikler */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
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

      {/* ── Aşağı kaydır göstergesi ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
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
