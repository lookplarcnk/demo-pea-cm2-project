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
  // ✅ เพิ่มส่วนนี้เพื่อขยายขีดจำกัดขนาดไฟล์เป็น 1000kB (1MB)
  build: {
    chunkSizeWarningLimit: 1000, 
  }
})