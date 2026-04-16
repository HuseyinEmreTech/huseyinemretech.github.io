import { useTranslation } from '@/features/localization/LanguageContext'
import { useCookieConsent } from '@/features/compliance/CookieConsentContext'
import { useLegalNotice } from '@/features/compliance/LegalNoticeContext'

export function CookieConsentBanner() {
  const { t } = useTranslation()
  const { status, acceptAll, acceptNecessaryOnly } = useCookieConsent()
  const { openPrivacy, openCookies } = useLegalNotice()

  if (status !== 'pending') return null

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-banner-title"
      className="fixed inset-x-0 bottom-0 z-[2000] border-t border-white/10 bg-[#05050a]/95 p-4 shadow-[0_-8px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl md:p-6"
    >
      <div className="container flex max-w-[1200px] flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl space-y-2 text-sm text-white/75">
          <h2 id="cookie-banner-title" className="text-base font-semibold text-white">
            {t('cookie-banner-title')}
          </h2>
          <p className="leading-relaxed">{t('cookie-banner-body')}</p>
          <p className="text-xs text-white/45">
            <button
              type="button"
              onClick={openPrivacy}
              className="underline decoration-white/30 underline-offset-2 hover:text-white"
            >
              {t('footer-privacy')}
            </button>
            <span className="mx-2">·</span>
            <button
              type="button"
              onClick={openCookies}
              className="underline decoration-white/30 underline-offset-2 hover:text-white"
            >
              {t('footer-cookies')}
            </button>
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={acceptNecessaryOnly}
            className="btn btn-secondary min-h-[44px] min-w-[140px] px-6 py-3 text-[13px]"
          >
            {t('cookie-btn-necessary')}
          </button>
          <button
            type="button"
            onClick={acceptAll}
            className="btn btn-primary min-h-[44px] min-w-[140px] px-6 py-3 text-[13px]"
          >
            {t('cookie-btn-all')}
          </button>
        </div>
      </div>
    </div>
  )
}
