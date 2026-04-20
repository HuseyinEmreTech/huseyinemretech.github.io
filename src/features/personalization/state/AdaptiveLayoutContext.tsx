import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { PortfolioSectionId } from '@/shared/portfolio/sectionIds'

const STORAGE_KEY = 'adaptive-layout-v1'

function readStorage(): { layout?: SiteLayoutPreset; mood?: SiteMoodPreset } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as { layout?: SiteLayoutPreset; mood?: SiteMoodPreset }) : {}
  } catch {
    return {}
  }
}

function writeStorage(layout: SiteLayoutPreset, mood: SiteMoodPreset) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ layout, mood }))
  } catch {
    // private browsing or storage full — silently ignore
  }
}

export type SiteLayoutPreset = 'technical' | 'business' | 'creative'
export type SiteMoodPreset = 'professional' | 'energetic' | 'minimal'

/** @deprecated Prefer SiteLayoutPreset; kept for incremental refactors. */
export type LayoutType = SiteLayoutPreset
/** @deprecated Prefer SiteMoodPreset. */
export type MoodType = SiteMoodPreset

interface AdaptiveLayoutContextValue {
  layout: SiteLayoutPreset
  mood: SiteMoodPreset
  sectionOrder: PortfolioSectionId[]
  setLayout: (layout: SiteLayoutPreset) => void
  setMood: (mood: SiteMoodPreset) => void
}

const SECTION_ORDER_BY_LAYOUT: Record<SiteLayoutPreset, PortfolioSectionId[]> = {
  technical: ['about', 'projects', 'coursework', 'skills', 'experience', 'education', 'contact'],
  business: ['about', 'experience', 'education', 'skills', 'projects', 'coursework', 'contact'],
  creative: ['about', 'projects', 'coursework', 'experience', 'education', 'skills', 'contact'],
}

const AdaptiveLayoutContext = createContext<AdaptiveLayoutContextValue | undefined>(undefined)

export function AdaptiveProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<{ layout: SiteLayoutPreset; mood: SiteMoodPreset }>(() => {
    const s = readStorage()
    return { layout: s.layout ?? 'technical', mood: s.mood ?? 'professional' }
  })

  const { layout, mood } = prefs

  const setLayout = useCallback((layout: SiteLayoutPreset) => setPrefs(p => ({ ...p, layout })), [])
  const setMood = useCallback((mood: SiteMoodPreset) => setPrefs(p => ({ ...p, mood })), [])

  useEffect(() => {
    writeStorage(layout, mood)
  }, [layout, mood])

  const sectionOrder = useMemo(() => SECTION_ORDER_BY_LAYOUT[layout], [layout])

  const value = useMemo(
    () => ({ layout, mood, sectionOrder, setLayout, setMood }),
    [layout, mood, sectionOrder, setLayout, setMood],
  )

  return <AdaptiveLayoutContext.Provider value={value}>{children}</AdaptiveLayoutContext.Provider>
}

export function useAdaptive() {
  const context = useContext(AdaptiveLayoutContext)
  if (context === undefined) {
    throw new Error('useAdaptive must be used within an AdaptiveProvider')
  }
  return context
}
