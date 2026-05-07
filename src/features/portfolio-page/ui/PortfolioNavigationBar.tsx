import * as React from 'react'
import { motion, useScroll, useMotionValueEvent, AnimatePresence, type Variants } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { useTranslation } from '@/features/localization/LanguageContext'
import { type TranslationKey } from '@/features/localization/translations'
import { useAdaptive } from '@/features/personalization/state/AdaptiveLayoutContext'

const EXPAND_SCROLL_THRESHOLD = 180
const COOLDOWN_MS = 600

const containerVariants = {
  initial: {
    y: -90,
    opacity: 0,
  },
  expanded: {
    y: 0,
    opacity: 1,
    maxWidth: '800px',
    transition: {
      y: { type: 'spring', damping: 26, stiffness: 180 },
      opacity: { duration: 0.3 },
      maxWidth: { type: 'spring', damping: 28, stiffness: 200 },
      staggerChildren: 0.04,
      delayChildren: 0.06,
    },
  },
  collapsed: {
    y: 0,
    opacity: 1,
    maxWidth: '3.5rem',
    transition: {
      maxWidth: { type: 'spring', damping: 28, stiffness: 200 },
      when: 'afterChildren',
    },
  },
} as Variants

const logoVariants = {
  expanded: { opacity: 1, x: 0, scale: 1, transition: { type: 'spring', damping: 15 } },
  collapsed: {
    opacity: 0,
    x: -12,
    scale: 0.96,
    transition: { duration: 0.1, ease: 'easeIn' },
  },
} as Variants

const itemVariants = {
  expanded: { opacity: 1, x: 0, scale: 1, transition: { type: 'spring', damping: 15 } },
  collapsed: { opacity: 0, x: -16, scale: 0.95, transition: { duration: 0.18 } },
} as Variants

const langVariants = {
  expanded: { opacity: 1, x: 0, transition: { type: 'spring', damping: 15 } },
  collapsed: { opacity: 0, x: 10, transition: { duration: 0.15 } },
} as Variants

export function PortfolioNavigationBar() {
  const { lang, t, setLanguage } = useTranslation()
  const { sectionOrder } = useAdaptive()
  const [isExpanded, setExpanded] = React.useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const { scrollY } = useScroll()
  const lastScrollY = React.useRef(0)
  const scrollPositionOnCollapse = React.useRef(0)
  const isExpandedRef = React.useRef(true)
  const lastChangeAt = React.useRef(0)

  const navItems = React.useMemo(() => {
    const keyMap: Record<string, string> = {
      about: 'nav-about',
      experience: 'nav-exp',
      education: 'nav-edu',
      projects: 'nav-proj',
      coursework: 'nav-coursework',
      skills: 'nav-skills',
      contact: 'nav-contact',
    }

    return sectionOrder.map((id) => ({
      name: t((keyMap[id] || `nav-${id}`) as TranslationKey),
      href: `#${id}`,
    }))
  }, [sectionOrder, t])

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const previous = lastScrollY.current
    lastScrollY.current = latest

    const now = Date.now()
    if (now - lastChangeAt.current < COOLDOWN_MS) return

    if (isExpandedRef.current && latest > previous && latest > 300) {
      isExpandedRef.current = false
      setExpanded(false)
      scrollPositionOnCollapse.current = latest
      lastChangeAt.current = now
    } else if (
      !isExpandedRef.current &&
      latest < previous &&
      scrollPositionOnCollapse.current - latest > EXPAND_SCROLL_THRESHOLD
    ) {
      isExpandedRef.current = true
      setExpanded(true)
      lastChangeAt.current = now
    }
  })

  // Prevent scroll when mobile menu is open
  React.useEffect(() => {
    if (!isMobileMenuOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [isMobileMenuOpen])

  const handleNavClick = (e: React.MouseEvent) => {
    if (!isExpanded) {
      const target = e.target as HTMLElement
      if (target.closest('a')) e.preventDefault()
      setExpanded(true)
    }
  }

  const handleLangToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    setLanguage(lang === 'tr' ? 'en' : 'tr')
  }

  return (
    <>
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[1100] w-full max-w-fit px-4 md:px-0">
        <motion.nav
          initial="initial"
          animate={isExpanded ? 'expanded' : 'collapsed'}
          variants={containerVariants}
          whileHover={!isExpanded ? { scale: 1.05 } : {}}
          whileTap={!isExpanded ? { scale: 0.95 } : {}}
          onClick={handleNavClick}
          className={cn(
            'flex items-center overflow-hidden rounded-full h-12 select-none mx-auto',
            'border border-white/10 bg-[rgba(4,4,12,0.85)] backdrop-blur-2xl',
            'shadow-[0_0_0_1px_rgba(34,211,238,0.18),0_0_20px_rgba(6,182,212,0.1),0_8px_32px_rgba(0,0,0,0.5)]',
            !isExpanded && 'cursor-pointer justify-center',
            isExpanded ? 'px-4 gap-4' : 'px-0',
          )}
          aria-label={t('menu-label')}
        >
          {/* Logo */}
          <motion.div
            variants={logoVariants}
            className="flex-shrink-0 flex items-center gap-2"
          >
            <span className="font-bold text-sm tracking-tight bg-gradient-to-r from-white to-cyan-400 bg-clip-text text-transparent whitespace-nowrap hidden sm:inline">
              Hüseyin Emre
            </span>
            <span className="w-1 h-1 rounded-full bg-indigo-500 opacity-70 hidden sm:inline" />
          </motion.div>

          {/* Nav links (Desktop) */}
          <div className="hidden md:flex items-center gap-1">
            <AnimatePresence>
              {isExpanded && (
                <motion.div className="flex items-center gap-0.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {navItems.map((item) => (
                    <motion.a
                      key={item.name}
                      href={item.href}
                      variants={itemVariants}
                      onClick={(e) => e.stopPropagation()}
                      className="text-[0.82rem] font-medium text-white/55 hover:text-white transition-colors px-2.5 py-1 rounded-full hover:bg-white/5 whitespace-nowrap"
                    >
                      {item.name}
                    </motion.a>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Lang toggle & Mobile Menu Toggle */}
          <div className="flex items-center gap-2">
            <motion.button
              variants={langVariants}
              onClick={handleLangToggle}
              className={cn(
                'flex-shrink-0 text-[0.72rem] font-mono text-white/40 hover:text-white/80',
                'border border-white/10 rounded-md px-1.5 py-0.5 bg-white/[0.03] hover:bg-white/[0.07] transition-colors',
                isMobileMenuOpen && 'pointer-events-none opacity-0',
              )}
              aria-label={lang === 'tr' ? 'English' : 'Türkçe'}
            >
              {lang === 'tr' ? '🇬🇧 EN' : '🇹🇷 TR'}
            </motion.button>

            <motion.button
              variants={langVariants}
              className="md:hidden flex-shrink-0 p-1 text-white/60 hover:text-white"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </motion.button>
          </div>

          {/* Dar pill — sadece md+; staggerChildren'dan ayrı: açılınca hemen kaybolmalı */}
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
            aria-hidden="true"
          >
            <motion.div
              animate={{
                opacity: isExpanded ? 0 : 1,
                scale: isExpanded ? 0.82 : 1,
              }}
              transition={{
                opacity: {
                  duration: isExpanded ? 0.09 : 0.18,
                  delay: isExpanded ? 0 : 0.07,
                },
                scale: {
                  duration: isExpanded ? 0.09 : 0.18,
                  delay: isExpanded ? 0 : 0.07,
                },
              }}
            >
              <Menu className="h-5 w-5 text-white/70" />
            </motion.div>
          </div>
        </motion.nav>
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1200] bg-black/60 backdrop-blur-xl md:hidden flex flex-col items-center justify-center p-8"
          >
            <button
              className="absolute top-8 right-8 p-2 text-white/50 hover:text-white"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-8 w-8" />
            </button>

            <div className="flex flex-col items-center gap-8">
              {navItems.map((item, idx) => (
                <motion.a
                  key={item.name}
                  href={item.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-2xl font-bold tracking-tight text-white hover:text-cyan-400 transition-colors"
                >
                  {item.name}
                </motion.a>
              ))}

              <button
                onClick={handleLangToggle}
                className="mt-8 text-sm font-mono text-white/60 border border-white/20 rounded-full px-6 py-2 hover:bg-white/5"
              >
                 {lang === 'tr' ? 'Switch to English 🇬🇧' : 'Türkçe\'ye Geç 🇹🇷'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
