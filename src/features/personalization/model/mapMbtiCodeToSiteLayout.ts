import type { SiteLayoutPreset } from '@/features/personalization/state/AdaptiveLayoutContext'

/**
 * Maps a four-letter MBTI code to a coarse site layout preset.
 * This is intentionally heuristic (demo-quality), not a clinical instrument.
 */
export function mapMbtiCodeToSiteLayout(mbtiTypeCode: string): SiteLayoutPreset {
  if (mbtiTypeCode.startsWith('E')) return 'technical'
  if (mbtiTypeCode.includes('NF')) return 'creative'
  return 'business'
}
