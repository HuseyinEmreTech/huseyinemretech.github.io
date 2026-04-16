import type { ReactNode } from 'react'
import { AppErrorBoundary } from '@/app/error/AppErrorBoundary'
import { LanguageProvider } from '@/features/localization/LanguageContext'
import { AdaptiveProvider } from '@/features/personalization/state/AdaptiveLayoutContext'
import { LegalNoticeProvider } from '@/features/compliance/LegalNoticeContext'
import { CookieConsentProvider } from '@/features/compliance/CookieConsentContext'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AppErrorBoundary>
      <LanguageProvider>
        <LegalNoticeProvider>
          <CookieConsentProvider>
            <AdaptiveProvider>{children}</AdaptiveProvider>
          </CookieConsentProvider>
        </LegalNoticeProvider>
      </LanguageProvider>
    </AppErrorBoundary>
  )
}
