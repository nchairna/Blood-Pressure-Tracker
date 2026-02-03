import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks - separate large dependencies
          'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'charts': ['recharts'],
          'pdf': ['jspdf', 'jspdf-autotable'],
          'ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-label',
            '@radix-ui/react-popover',
            '@radix-ui/react-select',
            '@radix-ui/react-slot',
            '@radix-ui/react-tabs',
          ],
        },
      },
    },
    // Increase chunk size warning limit for vendor chunks (optional)
    chunkSizeWarningLimit: 600,
  },
})
