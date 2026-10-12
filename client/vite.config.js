import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@staffora/auth': fileURLToPath(new URL('../server/shared/auth/accounts.js', import.meta.url)),
      '@staffora/api': fileURLToPath(new URL('../server/shared/api.js', import.meta.url)),
      '@staffora/data': fileURLToPath(new URL('../server/shared/DataProvider.jsx', import.meta.url)),
    },
  },
  server: {
    port: 5177,
    strictPort: true,
    fs: { allow: ['..'] },
  },
})
