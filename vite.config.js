import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'https://ourlove5504-gtr5j.ondigitalocean.app/',
                changeOrigin: true
            }
        }
    }
})
