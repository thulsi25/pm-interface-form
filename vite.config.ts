import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // FSEvents does not report changes for this project path, which left the
    // dev server serving stale modules after every edit. Polling is reliable here.
    watch: { usePolling: true, interval: 300 },
  },
})
