import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { PortfolioSectionId } from '@/shared/portfolio/sectionIds'

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
  const [layout, setLayout] = useState<SiteLayoutPreset>('technical')
  const [mood, setMood] = useState<SiteMoodPreset>('professional')

  const sectionOrder = useMemo(() => SECTION_ORDER_BY_LAYOUT[layout], [layout])

  const value = useMemo(
    () => ({ layout, mood, sectionOrder, setLayout, setMood }),
    [layout, mood, sectionOrder],
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
