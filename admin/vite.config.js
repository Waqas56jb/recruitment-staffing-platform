import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: [
      { find: '@staffora/auth', replacement: fileURLToPath(new URL('../server/shared/auth/accounts.js', import.meta.url)) },
      { find: '@staffora/api', replacement: fileURLToPath(new URL('../server/shared/api.js', import.meta.url)) },
      { find: '@staffora/data', replacement: fileURLToPath(new URL('../server/shared/DataProvider.jsx', import.meta.url)) },
      { find: /^react$/, replacement: fileURLToPath(new URL('./node_modules/react', import.meta.url)) },
      { find: /^react\/jsx-runtime$/, replacement: fileURLToPath(new URL('./node_modules/react/jsx-runtime.js', import.meta.url)) },
      { find: /^react\/jsx-dev-runtime$/, replacement: fileURLToPath(new URL('./node_modules/react/jsx-dev-runtime.js', import.meta.url)) },
      { find: /^react-dom$/, replacement: fileURLToPath(new URL('./node_modules/react-dom', import.meta.url)) },
      { find: /^react-dom\/client$/, replacement: fileURLToPath(new URL('./node_modules/react-dom/client.js', import.meta.url)) },
    ],
  },
  server: {
    port: 5184,
    strictPort: true,
    fs: { allow: ['..'] },
  },
})
