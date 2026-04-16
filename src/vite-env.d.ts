/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GITHUB_USERNAME?: string
  readonly VITE_GITHUB_REPOS_PER_PAGE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
