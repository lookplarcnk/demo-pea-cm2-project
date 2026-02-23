import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // แก้ไขบรรทัดล่างนี้เป็น '/' เพื่อให้รันที่ root โดยตรง ส่วนอื่นคงเดิมห้ามแก้ไข
  base: '/', 
  // ส่วนนี้คงไว้เพื่อแก้ปัญหา WebSocket ตามที่ตั้งค่าไว้ก่อนหน้า
  server: {
    hmr: {
      path: 'vite-hmr',
    },
  },
})