import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { standaloneProjectsPlugin } from './vite/standaloneProjectsPlugin'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react(), standaloneProjectsPlugin(rootDir)],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, 'src'),
      '@core': path.resolve(rootDir, 'src/core'),
      '@services': path.resolve(rootDir, 'src/services'),
      '@hooks': path.resolve(rootDir, 'src/hooks'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(rootDir, 'index.html'),
      },
    },
  },
})
