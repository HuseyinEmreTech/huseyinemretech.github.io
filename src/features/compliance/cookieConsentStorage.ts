export type CookieConsentValue = 'necessary' | 'all'

const STORAGE_KEY = 'huseyinemre.portfolio.cookieConsent'

export function readStoredCookieConsent(): CookieConsentValue | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw === 'necessary' || raw === 'all') return raw
  } catch {
    /* private mode / blocked storage */
  }
  return null
}

export function writeStoredCookieConsent(value: CookieConsentValue): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, value)
  } catch {
    /* ignore */
  }
}
