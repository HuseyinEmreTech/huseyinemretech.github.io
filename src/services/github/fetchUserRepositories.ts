import type { GithubPortfolioRepository } from '@/shared/types/portfolio'
import { GITHUB_API_BASE_URL, githubPortfolioPublicEnv } from '@core/config'
import { logger } from '@/shared/logging/logger'

function pickString(value: unknown): string | null {
  return typeof value === 'string' ? value : null
}

function pickNumber(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : 0
}

function normalizeGithubRepositoryRow(row: unknown): GithubPortfolioRepository | null {
  if (typeof row !== 'object' || row === null) return null
  const record = row as Record<string, unknown>
  const id = pickNumber(record.id)
  const name = pickString(record.name)
  const html_url = pickString(record.html_url)
  if (!name || !html_url) return null
  return {
    id,
    name,
    description: pickString(record.description),
    html_url,
    homepage: pickString(record.homepage),
    stargazers_count: pickNumber(record.stargazers_count),
    language: pickString(record.language),
    topics: Array.isArray(record.topics)
      ? record.topics.filter((t): t is string => typeof t === 'string')
      : undefined,
  }
}

/**
 * Fetches public repositories for a GitHub user (portfolio grid).
 */
export async function fetchGithubUserRepositories(
  username: string = githubPortfolioPublicEnv.username,
  perPage: number = githubPortfolioPublicEnv.repositoriesPerPage,
): Promise<GithubPortfolioRepository[]> {
  const url = `${GITHUB_API_BASE_URL}/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=${perPage}`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`GitHub API responded with ${response.status}`)
  }
  const payload: unknown = await response.json()
  if (!Array.isArray(payload)) {
    logger.warn('GitHub repositories payload was not an array')
    return []
  }
  return payload
    .map(normalizeGithubRepositoryRow)
    .filter((row): row is GithubPortfolioRepository => row !== null)
}
