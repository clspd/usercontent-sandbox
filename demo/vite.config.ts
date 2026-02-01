import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    rolldownOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        // site: resolve(__dirname, 'site.html'),
      },
      external: [],
    },
    outDir: '../web/demo',
    emptyOutDir: true,
    sourcemap: true,
  },
  base: '/demo/',
})
