import fs from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'

function mimeType(filePath: string): string {
  if (filePath.endsWith('.html')) return 'text/html; charset=utf-8'
  if (filePath.endsWith('.js')) return 'text/javascript; charset=utf-8'
  if (filePath.endsWith('.json')) return 'application/json; charset=utf-8'
  if (filePath.endsWith('.css')) return 'text/css; charset=utf-8'
  if (filePath.endsWith('.svg')) return 'image/svg+xml'
  if (filePath.endsWith('.png')) return 'image/png'
  if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) return 'image/jpeg'
  if (filePath.endsWith('.webp')) return 'image/webp'
  if (filePath.endsWith('.ico')) return 'image/x-icon'
  if (filePath.endsWith('.pdf')) return 'application/pdf'
  return 'application/octet-stream'
}

/**
 * Dev: serve `/standalone-projects/*` from repo `standalone-projects/`.
 * Build: copy the whole folder into `dist/` so GIS images + ML demo keep working on GitHub Pages.
 */
export function standaloneProjectsPlugin(repoRoot: string): Plugin {
  return {
    name: 'standalone-projects-static',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0] ?? ''
        if (!url.startsWith('/standalone-projects/')) {
          next()
          return
        }
        const relativePath = url.slice(1)
        let filePath = path.join(repoRoot, relativePath)
        try {
          if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
            filePath = path.join(filePath, 'index.html')
          }
          if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
            next()
            return
          }
          res.setHeader('Content-Type', mimeType(filePath))
          res.end(fs.readFileSync(filePath))
        } catch {
          next()
        }
      })
    },
    closeBundle() {
      const src = path.join(repoRoot, 'standalone-projects')
      const dest = path.join(repoRoot, 'dist', 'standalone-projects')
      if (!fs.existsSync(src)) return
      fs.mkdirSync(path.dirname(dest), { recursive: true })
      fs.cpSync(src, dest, { recursive: true })
    },
  }
}
