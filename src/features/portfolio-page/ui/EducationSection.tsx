import { motion } from 'framer-motion'
import { useTranslation } from '@/features/localization/LanguageContext'
import { educations as educationData } from '@/entities/portfolio-profile/content'
import { GraduationCap } from 'lucide-react'

export function EducationSection() {
  const { t, translateContent } = useTranslation()

  return (
    <section id="education" className="py-32">
      <div className="container">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-20 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent uppercase">
          {t('sec-edu')}
        </h2>
        <div className="grid md:grid-cols-2 gap-10">
          {educationData.map((edu, idx) => (
            <motion.div
              key={`${edu.school}-${edu.date}-${idx}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500 group"
            >
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-start">
                  <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/30">
                    {translateContent(edu.date)}
                  </span>
                  <div className="p-3 rounded-2xl bg-white/[0.03] text-white/40 group-hover:text-cyan-400 transition-colors">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold tracking-tight text-white mb-2 leading-tight">
                    {translateContent(edu.title)}
                  </h3>
                  <div className="text-lg text-white/50 font-light leading-relaxed">
                    {translateContent(edu.school)}
                  </div>
                  <p className="text-xs font-mono text-cyan-400/70 mt-2">{translateContent(edu.degree)}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
