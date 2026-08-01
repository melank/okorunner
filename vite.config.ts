import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const TAURI_DEVELOPMENT_PORT = 1420
const TAURI_SOURCE_DIRECTORY = '**/src-tauri/**'

const TAURI_PACKAGES = [
  '@tauri-apps/api',
  '@tauri-apps/api/core',
  '@tauri-apps/plugin-sql',
  '@tauri-apps/plugin-global-shortcut',
  '@tauri-apps/plugin-notification',
]

export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  optimizeDeps: {
    exclude: TAURI_PACKAGES,
  },
  server: {
    port: TAURI_DEVELOPMENT_PORT,
    strictPort: true,
    watch: {
      ignored: [TAURI_SOURCE_DIRECTORY],
    },
  },
})
