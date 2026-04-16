import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { readStoredCookieConsent, writeStoredCookieConsent, type CookieConsentValue } from './cookieConsentStorage'

export type CookieConsentStatus = 'pending' | CookieConsentValue

interface CookieConsentContextValue {
  status: CookieConsentStatus
  /** GitHub API ve benzeri üçüncü taraf içerik yüklemeleri için (çerez banner’ı yanıtlandıktan sonra). */
  thirdPartyContentAllowed: boolean
  /** Google Fonts yüklemesi yalnızca `all` seçiminde. */
  googleFontsAllowed: boolean
  acceptAll: () => void
  acceptNecessaryOnly: () => void
}

const CookieConsentContext = createContext<CookieConsentContextValue | undefined>(undefined)

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<CookieConsentStatus>(() => readStoredCookieConsent() ?? 'pending')

  const acceptAll = useCallback(() => {
    writeStoredCookieConsent('all')
    setStatus('all')
  }, [])

  const acceptNecessaryOnly = useCallback(() => {
    writeStoredCookieConsent('necessary')
    setStatus('necessary')
  }, [])

  const value = useMemo<CookieConsentContextValue>(
    () => ({
      status,
      thirdPartyContentAllowed: status !== 'pending',
      googleFontsAllowed: status === 'all',
      acceptAll,
      acceptNecessaryOnly,
    }),
    [status, acceptAll, acceptNecessaryOnly],
  )

  return <CookieConsentContext.Provider value={value}>{children}</CookieConsentContext.Provider>
}

export function useCookieConsent() {
  const ctx = useContext(CookieConsentContext)
  if (!ctx) throw new Error('useCookieConsent must be used within CookieConsentProvider')
  return ctx
}
