import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    rolldownOptions: {
      input: {
        main: resolve(fileURLToPath(import.meta.url), 'index.html'),
        // site: resolve(fileURLToPath(import.meta.url), 'site.html'),
      },
      external: [],
    },
    outDir: '../web/demo',
    emptyOutDir: true,
    sourcemap: true,
  },
  base: '/demo/',
})
