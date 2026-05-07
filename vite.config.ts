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
    sourcemap: 'hidden',
    // Spline ~4MB — beklenen büyüklük, uyarı gereksiz
    chunkSizeWarningLimit: 2200,
    modulePreload: {
      resolveDependencies: (_filename, deps) => deps.filter((dep) => !dep.includes('spline')),
    },
    rollupOptions: {
      input: {
        main: path.resolve(rootDir, 'index.html'),
      },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('framer-motion')) return 'vendor-motion'
            if (id.includes('lucide-react')) return 'vendor-icons'
            if (id.includes('react/') || id.includes('react-dom/')) return 'vendor-react'
          }
        },
      },
    },
  },
})
