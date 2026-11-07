import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import vercel from './vercel.json' with { type: 'json' }

// The preview server sends the same headers as Vercel, so end-to-end tests check what production serves.
const productionHeaders = Object.fromEntries(
  vercel.headers.flatMap((rule) => rule.headers.map((header) => [header.key, header.value])),
)

export default defineConfig({
  plugins: [react(), tailwindcss()],
  preview: { headers: productionHeaders },
  build: {
    rollupOptions: {
      output: {
        // Third-party code changes rarely, so it gets its own long-lived chunk.
        manualChunks: (id) => (id.includes('node_modules') ? 'vendor' : undefined),
      },
    },
  },
})
