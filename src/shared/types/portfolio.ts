export interface Experience {
  title: string
  company: string
  date: string
  description: string
  responsibilities: string[]
}

export interface Education {
  title: string
  school: string
  date: string
  degree: string
}

export interface Skill {
  name: string
  category: 'erp' | 'dev' | 'tech'
}

/** Subset of GitHub repository JSON used by the portfolio grid. */
export interface GithubPortfolioRepository {
  id: number
  name: string
  description: string | null
  html_url: string
  homepage: string | null
  stargazers_count: number
  language: string | null
  topics?: string[]
}
