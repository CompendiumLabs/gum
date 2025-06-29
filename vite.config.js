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
  build: {
    outDir: 'dist',
    rollupOptions: {
      external: ['@babel/standalone', 'mathjax'],
      output: {
        globals: { '@babel/standalone': 'Babel', 'mathjax': 'MathJax' },
      },
    },
  },
}))
