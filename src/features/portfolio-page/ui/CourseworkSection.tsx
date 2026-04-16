import { motion } from 'framer-motion'
import { BarChart3, ExternalLink, Map } from 'lucide-react'
import { useTranslation } from '@/features/localization/LanguageContext'
import { COURSEWORK_PAGE_PATHS } from '@core/constants/courseworkPages'

export function CourseworkSection() {
  const { t } = useTranslation()

  const cards = [
    {
      href: COURSEWORK_PAGE_PATHS.gisCourseProject,
      Icon: Map,
      title: t('coursework-gis-title'),
      description: t('coursework-gis-desc'),
      cta: t('coursework-gis-cta'),
    },
    {
      href: COURSEWORK_PAGE_PATHS.carWashMlProject,
      Icon: BarChart3,
      title: t('coursework-ml-title'),
      description: t('coursework-ml-desc'),
      cta: t('coursework-ml-cta'),
    },
  ] as const

  return (
    <section id="coursework" className="py-32 relative">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-6 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
          {t('sec-coursework')}
        </h2>
        <p className="text-white/45 text-base md:text-lg max-w-2xl mb-16 leading-relaxed">
          {t('coursework-intro')}
        </p>

        <div className="grid md:grid-cols-2 gap-10">
          {cards.map((card, idx) => (
            <motion.article
              key={card.href}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08 }}
              className="group relative flex flex-col p-8 rounded-[2rem] bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500 overflow-hidden"
            >
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/[0.01] rounded-full blur-3xl group-hover:bg-white/[0.03] transition-colors" />

              <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] text-white/50 group-hover:text-cyan-300 transition-colors">
                  <card.Icon className="w-6 h-6" />
                </div>
                <ExternalLink className="w-5 h-5 text-white/25 group-hover:text-white/60 transition-colors" aria-hidden />
              </div>

              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors leading-tight">
                {card.title}
              </h3>
              <p className="text-white/40 text-sm mb-8 leading-relaxed flex-1">{card.description}</p>

              <a
                href={card.href}
                className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-400/90 hover:text-cyan-300 transition-colors mt-auto"
              >
                {card.cta}
                <ExternalLink className="w-4 h-4" aria-hidden />
              </a>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
