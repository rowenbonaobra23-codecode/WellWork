import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Required for Capacitor - relative paths
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Let Vite use default minification
  },
  server: {
    host: '0.0.0.0', // Allow access from mobile device on same network
    port: 5173
  }
})
