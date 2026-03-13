import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  server: {
    port: 5185,
    strictPort: true,
  },
  plugins: [
    react(),
    tailwindcss({
      config: path.resolve(__dirname, './tailwind.config.js'), 
    }),
  ],
})