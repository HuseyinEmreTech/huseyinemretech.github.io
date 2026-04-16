/** Stable DOM / routing identifiers for one-page portfolio sections. */
export type PortfolioSectionId =
  | 'about'
  | 'experience'
  | 'education'
  | 'projects'
  | 'coursework'
  | 'skills'
  | 'contact'

const PORTFOLIO_SECTION_IDS = new Set<PortfolioSectionId>([
  'about',
  'experience',
  'education',
  'projects',
  'coursework',
  'skills',
  'contact',
])

export function isPortfolioSectionId(value: string): value is PortfolioSectionId {
  return PORTFOLIO_SECTION_IDS.has(value as PortfolioSectionId)
}
