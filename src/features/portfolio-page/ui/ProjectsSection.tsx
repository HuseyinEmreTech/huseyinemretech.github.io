import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from '@/features/localization/LanguageContext'
import { useGithubPortfolioProjects } from '@hooks/useGithubPortfolioProjects'
import { useCookieConsent } from '@/features/compliance/CookieConsentContext'
import { ProjectWaveDemo } from '@/shared/components/ui/project-wave-demo'
import { WavePixelControls } from '@/shared/components/ui/wave-pixel-controls'
import { Github, ExternalLink, Star, Code2 } from 'lucide-react'

export function ProjectsSection() {
  const { t } = useTranslation()
  const { status } = useCookieConsent()
  const { repositories, isLoading, loadError } = useGithubPortfolioProjects()
  const [wavePxSize, setWavePxSize] = useState(3)

  return (
    <section id="projects" className="py-32">
      <div className="container">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-20 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
          {t('sec-proj')}
        </h2>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]"
        >
          <div className="rounded-[2rem] border border-white/[0.06] bg-white/[0.02] p-3">
            <ProjectWaveDemo pxSize={wavePxSize} waveLabel={t('projects-wave-label')} />
          </div>
          <div className="flex flex-col justify-center gap-6 rounded-[2rem] border border-white/[0.06] bg-white/[0.02] p-8 backdrop-blur-sm">
            <div className="mb-1 inline-flex max-w-fit items-center rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.25em] text-cyan-300">
              {t('projects-wave-badge')}
            </div>
            <div>
              <h3 className="mb-4 text-2xl font-bold tracking-tight text-white md:text-3xl">
                {t('projects-wave-title')}
              </h3>
              <p className="max-w-lg text-sm leading-relaxed text-white/55 md:text-base">
                {t('projects-wave-desc')}
              </p>
            </div>
            <WavePixelControls
              value={wavePxSize}
              onChange={setWavePxSize}
              label={t('projects-wave-pixel-label')}
            />
          </div>
        </motion.div>

        {status === 'pending' ? (
          <p className="mb-10 max-w-xl text-sm leading-relaxed text-white/45">{t('projects-consent-hint')}</p>
        ) : null}

        {loadError ? (
          <p className="text-sm text-red-400/90" role="alert">
            {loadError.message}
          </p>
        ) : null}

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-72 rounded-[2rem] bg-white/[0.02] animate-pulse border border-white/[0.05]"
              />
            ))}
          </div>
        ) : repositories.length === 0 ? (
          status === 'pending' ? null : (
            <p className="text-sm text-white/35">{t('projects-empty')}</p>
          )
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {repositories.map((repository, idx) => (
              <motion.div
                key={repository.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group relative flex flex-col p-8 rounded-[2rem] bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500 overflow-hidden"
              >
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/[0.01] rounded-full blur-3xl group-hover:bg-white/[0.03] transition-colors" />

                <div className="flex justify-between items-start mb-10 relative z-10">
                  <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] text-white/50 group-hover:text-white transition-colors">
                    <Code2 className="w-5 h-5" />
                  </div>
                  <div className="flex gap-3">
                    <a
                      href={repository.html_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-white/40 hover:text-white transition-colors"
                    >
                      <Github className="w-5 h-5" />
                    </a>
                    {repository.homepage ? (
                      <a
                        href={repository.homepage}
                        target="_blank"
                        rel="noreferrer"
                        className="text-white/40 hover:text-white transition-colors"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    ) : null}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors leading-tight">
                  {repository.name}
                </h3>

                <p className="text-white/40 text-sm mb-6 line-clamp-3">
                  {repository.description?.trim()
                    ? repository.description.trim()
                    : 'No description provided.'}
                </p>

                <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                    <span className="text-xs font-mono text-white/60">
                      {repository.language ?? '—'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-white/30 text-xs">
                    <Star className="w-3.5 h-3.5" />
                    {repository.stargazers_count}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
