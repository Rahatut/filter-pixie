import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/filter-pixie/' : '/',
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/apply-filter': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/filters': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
}))