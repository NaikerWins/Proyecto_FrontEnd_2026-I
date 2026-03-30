import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    // Si 5173 está ocupado, Vite usa el siguiente puerto: registra ese origen en Google Cloud (OAuth).
    strictPort: false,
  },
})
