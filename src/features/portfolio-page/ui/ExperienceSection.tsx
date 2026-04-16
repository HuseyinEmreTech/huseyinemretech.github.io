import { motion } from 'framer-motion'
import { useTranslation } from '@/features/localization/LanguageContext'
import { experiences } from '@/entities/portfolio-profile/content'

export function ExperienceSection() {
  const { t, translateContent } = useTranslation()

  return (
    <section id="experience" className="py-32 relative">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-20 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
          {t('sec-exp')}
        </h2>

        <div className="relative border-l border-white/[0.05] ml-4 md:ml-8 space-y-16">
          {experiences.map((exp, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="relative pl-10 group"
            >
              <div className="absolute left-[-5px] top-2 w-[9px] h-[9px] rounded-full bg-white/10 border border-white/20 group-hover:bg-cyan-400 group-hover:border-cyan-400/50 group-hover:shadow-[0_0_15px_rgba(34,211,238,0.5)] transition-all duration-500" />

              <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/30 mb-2 block">
                {translateContent(exp.date)}
              </span>

              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 hover:bg-white/[0.05] transition-colors">
                <h3 className="text-xl font-bold text-white mb-1">{translateContent(exp.title)}</h3>
                <div className="text-white/60 font-medium mb-4">{translateContent(exp.company)}</div>

                {exp.description && (
                  <p className="text-white/40 text-sm leading-relaxed mb-4">{translateContent(exp.description)}</p>
                )}

                <ul className="space-y-2">
                  {exp.responsibilities.map((item, i) => (
                    <li key={i} className="flex gap-3 text-sm text-white/50 leading-relaxed">
                      <span className="text-indigo-400 mt-1">•</span>
                      {translateContent(item)}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
