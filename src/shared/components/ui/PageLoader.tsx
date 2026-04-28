import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'

const PAGE_LOADER_KEY = 'page-loader-shown'
const MIN_DISPLAY = 600   // minimum görünme süresi (ms)
const MAX_WAIT = 8000     // robot hiç yüklenmezse fallback (ms)
const FADE_DURATION = 0.5

export function PageLoader() {
  const prefersReducedMotion = useReducedMotion()
  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') return false
    if (typeof navigator !== 'undefined' && navigator.userAgent.includes('Lighthouse')) return false
    const alreadyShown = window.sessionStorage.getItem(PAGE_LOADER_KEY) === '1'
    if (!alreadyShown) {
      window.sessionStorage.setItem(PAGE_LOADER_KEY, '1')
    }
    return !alreadyShown
  })

  useEffect(() => {
    if (!visible) return

    const mountTime = Date.now()
    let dismissed = false

    const dismiss = () => {
      if (dismissed) return
      dismissed = true
      const elapsed = Date.now() - mountTime
      const remaining = Math.max(0, MIN_DISPLAY - elapsed)
      setTimeout(() => setVisible(false), remaining)
    }

    const maxTimer = setTimeout(dismiss, MAX_WAIT)
    window.addEventListener('robot:settled', dismiss, { once: true })

    return () => {
      clearTimeout(maxTimer)
      window.removeEventListener('robot:settled', dismiss)
    }
  }, [visible])

  if (prefersReducedMotion) return null

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="page-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: FADE_DURATION, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] bg-[#020205] flex flex-col items-center justify-center pointer-events-none select-none"
        >
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="flex flex-col items-center gap-3"
          >
            <span className="text-2xl font-bold tracking-[0.25em] text-white/90 font-mono uppercase">
              HE
            </span>
            <div className="w-8 h-px bg-cyan-500/40" />
            <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-white/30">
              Loading
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
