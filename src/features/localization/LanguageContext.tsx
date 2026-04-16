import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from 'react'
import {
  translations,
  isTranslationMessageKey,
  type SupportedLanguage,
  type TranslationKey,
} from '@/features/localization/translations'

interface LanguageContextType {
  lang: SupportedLanguage
  /** UI and layout copy with compile-time key safety. */
  t: (key: TranslationKey) => string
  /** Values coming from entity/content data: translates when the string is a known key, otherwise passthrough. */
  translateContent: (key: string) => string
  setLanguage: (lang: SupportedLanguage) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

function normalizeDocumentLanguage(raw: string): SupportedLanguage {
  return raw === 'en' ? 'en' : 'tr'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<SupportedLanguage>(() =>
    normalizeDocumentLanguage(document.documentElement.lang || 'tr'),
  )

  useEffect(() => {
    document.documentElement.lang = lang
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: lang }))
  }, [lang])

  const setLanguage = useCallback((newLang: SupportedLanguage) => {
    setLang(normalizeDocumentLanguage(newLang))
  }, [])

  const t = useCallback(
    (key: TranslationKey): string => {
      const active = translations[lang]
      const localized = active[key]
      if (localized) return localized
      if (lang !== 'tr') {
        return translations.tr[key]
      }
      return key
    },
    [lang],
  )

  const translateContent = useCallback(
    (key: string): string => {
      if (!isTranslationMessageKey(key)) return key
      return t(key)
    },
    [t],
  )

  return (
    <LanguageContext.Provider value={{ lang, t, translateContent, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider')
  }
  return context
}
