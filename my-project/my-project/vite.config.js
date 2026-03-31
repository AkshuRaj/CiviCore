import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/SOA/',
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:3000"
    }
  }
})
