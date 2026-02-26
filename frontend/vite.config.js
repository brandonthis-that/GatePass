import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'safari-pinned-tab.svg'],
      manifest: {
        name: 'GatePass Mobile Terminal',
        short_name: 'GatePass',
        description: 'ANU Gate Management System for Guards and Students',
        theme_color: '#1e3a8a', // blue-900ish for the top bar
        background_color: '#f9fafb',
        display: 'standalone',
        icons: [
          // Basic placeholders. In reality you'd have real 192 and 512 icons here.
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})
