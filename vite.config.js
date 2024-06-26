import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
       registerType: 'autoUpdate',
       manifest:{
        name: 'Copas Bet',
        short_name: 'BetApp',
        description: 'Mi PWA de apuestas',
        theme_color: '#ffffff',
        display:'standalone',
        display_override:['window-controls-overlay'],
        lang:'es-ES',
        id: "miAPPBet",
        orientation: "portrait",
        categories: [
          "games"
        ],
        icons: [
          {
            src: 'icono.jpeg',
            sizes: '192x192',
            type: 'image/jpeg'
          },
          {
            src: 'logo-png512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ],
       }
    })
  ],
})
