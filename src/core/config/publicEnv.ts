/**
 * Browser-exposed configuration (Vite: only VITE_* keys exist on import.meta.env).
 * Centralises magic strings and default fallbacks for the SPA.
 */

function readOptionalEnvString(key: string, fallback: string): string {
  const env = import.meta.env as Record<string, unknown>
  const raw = env[key]
  return typeof raw === 'string' && raw.trim().length > 0 ? raw.trim() : fallback
}

function readOptionalEnvPositiveInt(key: string, fallback: number): number {
  const env = import.meta.env as Record<string, unknown>
  const raw = env[key]
  if (typeof raw !== 'string') return fallback
  const parsed = Number.parseInt(raw, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

export const GITHUB_API_BASE_URL = 'https://api.github.com' as const

export const githubPortfolioPublicEnv = {
  /** GitHub username for the portfolio repository grid */
  username: readOptionalEnvString('VITE_GITHUB_USERNAME', 'huseyinemretech'),
  /** Page size for GET /users/{user}/repos */
  repositoriesPerPage: readOptionalEnvPositiveInt('VITE_GITHUB_REPOS_PER_PAGE', 9),
} as const
