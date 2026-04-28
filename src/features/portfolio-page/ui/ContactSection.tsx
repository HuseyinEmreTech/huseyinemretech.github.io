import { motion } from 'framer-motion'
import { useTranslation } from '@/features/localization/LanguageContext'
import { Mail, Linkedin, Github } from 'lucide-react'

export function ContactSection() {
  const { t } = useTranslation()

  return (
    <section id="contact" className="py-32">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-8 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent uppercase">
              {t('sec-contact')}
            </h2>
            <p className="text-lg text-white/40 font-light leading-relaxed max-w-xl mx-auto">
              {t('contact-desc')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            {/* Contact Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-500"
            >
              <h3 className="text-xl font-semibold mb-10 tracking-tight text-white/90">
                {t('contact-info')}
              </h3>
              <div className="space-y-8">
                {[
                  {
                    icon: Mail,
                    label: 'Email',
                    value: 'huseyinemre.tech@gmail.com',
                    href: 'mailto:huseyinemre.tech@gmail.com',
                  },
                  {
                    icon: Github,
                    label: 'GitHub',
                    value: 'github.com/huseyinemretech',
                    href: 'https://github.com/huseyinemretech',
                  },
                  {
                    icon: Linkedin,
                    label: 'LinkedIn',
                    value: 'linkedin.com/in/huseyinemretech',
                    href: 'https://linkedin.com/in/huseyinemretech',
                  },
                ].map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-6 group"
                  >
                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-white/20 group-hover:text-white group-hover:bg-white/10 transition-all duration-500">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/10 mb-1">
                        {item.label}
                      </div>
                      <div className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">
                        {item.value}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </motion.div>

            {/* Quick Links Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="p-10 rounded-[2.5rem] bg-indigo-500/[0.02] border border-indigo-500/5 hover:border-indigo-500/10 transition-all duration-500 flex flex-col justify-center items-center text-center"
            >
              <div className="w-20 h-20 rounded-full bg-white/[0.03] flex items-center justify-center mb-8">
                <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)] animate-pulse" />
              </div>
              <h3 className="text-2xl font-bold tracking-tighter mb-4">
                {t('contact-cta-title') || 'Work with me'}
              </h3>
              <p className="text-sm text-white/30 mb-8 max-w-[200px]">
                {t('contact-cta-desc') ||
                  'Her türlü iş birliği ve teknik danışmanlık için ulaşabilirsiniz.'}
              </p>
              <a
                href="mailto:huseyinemre.tech@gmail.com"
                className="btn btn-primary w-full max-w-[200px]"
              >
                {t('btn-contact')}
              </a>
              <p className="mt-6 max-w-[280px] text-center text-[11px] leading-relaxed text-white/35">
                {t('contact-kvkk-note')}
              </p>
            </motion.div>
          </div>

          <p className="mt-20 text-center text-[10px] font-mono uppercase tracking-[0.35em] text-white/15">
            {t('footer-scroll-hint')}
          </p>
        </div>
      </div>
    </section>
  )
}
