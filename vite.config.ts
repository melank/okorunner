import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const TAURI_DEVELOPMENT_PORT = 1420
const TAURI_SOURCE_DIRECTORY = '**/src-tauri/**'

export default defineConfig({
  plugins: [react()],
  server: {
    port: TAURI_DEVELOPMENT_PORT,
    strictPort: true,
    watch: {
      ignored: [TAURI_SOURCE_DIRECTORY],
    },
  },
})
