import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages 部署在 https://<user>.github.io/<repo>/ 下，需要 base
// 本地开发时 base 为 /
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/year-steward/' : '/',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
}))
