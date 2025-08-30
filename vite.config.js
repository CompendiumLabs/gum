import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  base: mode == 'development' ? '' : '/gum/',
  esbuild: {
    keepNames: true,
  },
  optimizeDeps: {
    exclude: ['@resvg/resvg-js']
  },
  build: {
    outDir: 'docs',
    target: 'esnext',
    rollupOptions: {
      external: ['mathjax'],
      output: {
        globals: { 'mathjax': 'MathJax' },
      },
    },
  },
  server: {
    watch: {
      ignored: [
        'test/**',
      ],
    },
  },
}))
