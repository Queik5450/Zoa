import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Disable minification to avoid lightningcss media-query parsing errors
    minify: false,
  },
})
