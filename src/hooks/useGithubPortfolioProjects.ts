import { useEffect, useState } from 'react'
import { fetchGithubUserRepositories } from '@services/github/fetchUserRepositories'
import { githubPortfolioPublicEnv } from '@core/config'
import type { GithubPortfolioRepository } from '@/shared/types/portfolio'
import { logger } from '@/shared/logging/logger'
import { useCookieConsent } from '@/features/compliance/CookieConsentContext'

export interface GithubPortfolioProjectsState {
  repositories: GithubPortfolioRepository[]
  isLoading: boolean
  loadError: Error | null
}

export function useGithubPortfolioProjects(): GithubPortfolioProjectsState {
  const { thirdPartyContentAllowed } = useCookieConsent()
  const [repositories, setRepositories] = useState<GithubPortfolioRepository[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false

    if (!thirdPartyContentAllowed) {
      setRepositories([])
      setLoadError(null)
      setIsLoading(false)
      return () => {
        cancelled = true
      }
    }

    async function load() {
      setIsLoading(true)
      setLoadError(null)
      try {
        const list = await fetchGithubUserRepositories(
          githubPortfolioPublicEnv.username,
          githubPortfolioPublicEnv.repositoriesPerPage,
        )
        if (!cancelled) setRepositories(list)
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error))
        logger.error('Failed to load GitHub repositories', err)
        if (!cancelled) {
          setLoadError(err)
          setRepositories([])
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [thirdPartyContentAllowed])

  return { repositories, isLoading, loadError }
}
