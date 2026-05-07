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
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      reporter: ['text', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/test/**', 'src/vite-env.d.ts'],
    },
  },
  build: {
    sourcemap: 'hidden',
    target: 'esnext',
    minify: 'esbuild',
    cssMinify: 'esbuild',
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
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') ?? []
          const ext = info[info.length - 1] ?? ''
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`
          }
          if (/css/i.test(ext)) {
            return `assets/css/[name]-[hash][extname]`
          }
          return `assets/[name]-[hash][extname]`
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Critical vendor chunks for better caching
            if (id.includes('@splinetool') || id.includes('spline')) return 'vendor-spline'
            if (id.includes('framer-motion')) return 'vendor-motion'
            if (id.includes('lucide-react')) return 'vendor-icons'
            if (id.includes('react/') || id.includes('react-dom/')) return 'vendor-react'
            if (id.includes('@radix-ui')) return 'vendor-radix'
            // Bundle remaining node_modules together
            return 'vendor-libs'
          }
          // Feature-based chunks for better tree shaking
          if (id.includes('/features/localization/')) return 'feature-i18n'
          if (id.includes('/features/personalization/')) return 'feature-personalization'
          if (id.includes('/features/portfolio-page/')) return 'feature-portfolio'
        },
      },
    },
  },
})
