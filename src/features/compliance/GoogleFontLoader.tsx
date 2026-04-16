import { useEffect } from 'react'
import { useCookieConsent } from '@/features/compliance/CookieConsentContext'

const FONTS_CSS_HREF =
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap'

/**
 * Google Fonts yalnızca açık tercih (`all`) ile yüklenir; KVKK / çerez rehberi ile uyum için.
 */
export function GoogleFontLoader() {
  const { googleFontsAllowed } = useCookieConsent()

  useEffect(() => {
    if (!googleFontsAllowed) {
      document.documentElement.classList.remove('fonts-google-enabled')
      return
    }

    const id = 'portfolio-google-fonts'
    if (document.getElementById(id)) {
      document.documentElement.classList.add('fonts-google-enabled')
      return
    }

    const link = document.createElement('link')
    link.id = id
    link.rel = 'stylesheet'
    link.href = FONTS_CSS_HREF
    document.head.appendChild(link)
    document.documentElement.classList.add('fonts-google-enabled')

    return () => {
      /* consent geri alınamaz bu oturumda; unmount’ta link silmiyoruz */
    }
  }, [googleFontsAllowed])

  return null
}
