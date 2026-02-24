import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/', 
  server: {
    hmr: {
      path: 'vite-hmr',
    },
  },
  build: {
    // ✅ มั่นใจว่าไฟล์จะไปอยู่ที่โฟลเดอร์ dist เสมอเพื่อให้ Vercel หาเจอ
    outDir: 'dist',
    chunkSizeWarningLimit: 1000, 
  }
})