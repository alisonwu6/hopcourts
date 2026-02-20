import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'
import { readFileSync } from 'fs'
import tailwindcss from '@tailwindcss/vite'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const packageJson = JSON.parse(
  readFileSync(path.resolve(__dirname, 'package.json'), 'utf-8')
)

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
  },
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // Listen on all addresses (0.0.0.0)
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
