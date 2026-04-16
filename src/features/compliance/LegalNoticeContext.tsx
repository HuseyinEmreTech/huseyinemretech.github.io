import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type LegalPanel = 'privacy' | 'cookies' | null

interface LegalNoticeContextValue {
  panel: LegalPanel
  openPrivacy: () => void
  openCookies: () => void
  closePanel: () => void
}

const LegalNoticeContext = createContext<LegalNoticeContextValue | undefined>(undefined)

function panelFromHash(hash: string): LegalPanel {
  const h = hash.startsWith('#') ? hash.slice(1) : hash
  if (h === 'privacy-policy') return 'privacy'
  if (h === 'cookie-policy') return 'cookies'
  return null
}

export function LegalNoticeProvider({ children }: { children: ReactNode }) {
  const [panel, setPanel] = useState<LegalPanel>(null)

  useEffect(() => {
    const sync = () => {
      setPanel(panelFromHash(window.location.hash))
    }
    sync()
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])

  const openPrivacy = useCallback(() => {
    setPanel('privacy')
    try {
      window.history.replaceState(null, '', '#privacy-policy')
    } catch {
      /* ignore */
    }
  }, [])

  const openCookies = useCallback(() => {
    setPanel('cookies')
    try {
      window.history.replaceState(null, '', '#cookie-policy')
    } catch {
      /* ignore */
    }
  }, [])

  const closePanel = useCallback(() => {
    setPanel(null)
    try {
      if (window.location.hash === '#privacy-policy' || window.location.hash === '#cookie-policy') {
        window.history.replaceState(null, '', window.location.pathname + window.location.search)
      }
    } catch {
      /* ignore */
    }
  }, [])

  const value = useMemo(
    () => ({ panel, openPrivacy, openCookies, closePanel }),
    [panel, openPrivacy, openCookies, closePanel],
  )

  return <LegalNoticeContext.Provider value={value}>{children}</LegalNoticeContext.Provider>
}

export function useLegalNotice() {
  const ctx = useContext(LegalNoticeContext)
  if (!ctx) throw new Error('useLegalNotice must be used within LegalNoticeProvider')
  return ctx
}
