import { useState, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from '@/features/localization/LanguageContext'
import { skills } from '@/entities/portfolio-profile/content'
import { Briefcase, Code, Wrench } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

import type { TranslationKey } from '@/features/localization/translations'

const categories: {
  id: string
  label: TranslationKey
  icon: ReactNode
}[] = [
  { id: 'all', label: 'filter-all', icon: null },
  { id: 'erp', label: 'filter-erp', icon: <Briefcase className="w-4 h-4" /> },
  { id: 'dev', label: 'filter-dev', icon: <Code className="w-4 h-4" /> },
  { id: 'tech', label: 'filter-tech', icon: <Wrench className="w-4 h-4" /> },
]

export function SkillsSection() {
  const { t, translateContent } = useTranslation()
  const [filter, setFilter] = useState('all')

  const filteredSkills = skills.filter(s => filter === 'all' || s.category === filter)

  return (
    <section id="skills" className="py-32">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-6">
          <div className="max-w-xl">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-6 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
              {t('sec-skills')}
            </h2>
            <p className="text-lg text-white/40 font-light leading-relaxed">
              {t('skills-desc') || 'Özelleşmiş alanlarda uzmanlık ve teknik yetkinlikler.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all",
                  filter === cat.id 
                    ? "bg-indigo-500 text-white shadow-[0_4px_12px_rgba(99,102,241,0.3)]" 
                    : "text-white/50 hover:text-white hover:bg-white/5"
                )}
              >
                {cat.icon}
                {t(cat.label)}
              </button>
            ))}
          </div>
        </div>

        <motion.div 
          layout
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filteredSkills.map((skill) => (
              <motion.div
                key={skill.name}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "flex items-center justify-center p-4 rounded-xl border transition-all text-center",
                  "bg-white/[0.03] border-white/10 hover:border-indigo-500/30 hover:bg-white/5"
                )}
              >
                <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">
                  {translateContent(skill.name)}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}
