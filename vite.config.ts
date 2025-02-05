import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('vue') || id.includes('@vue')) {
              return 'vue-vendor'
            }
            if (id.includes('chart.js')) {
              return 'chart'
            }
            if (id.includes('@supabase')) {
              return 'supabase'
            }
            return 'vendor'
          }
        }
      }
    }
  },
  server: {
    headers: {
      'X-Frame-Options': 'DENY'
    }
  }
})
