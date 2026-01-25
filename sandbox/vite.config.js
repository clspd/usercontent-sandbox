import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
    plugins: [],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        },
    },
    build: {
        lib: {
            entry: fileURLToPath(new URL('./src/main.js', import.meta.url)),
            formats: ['es'],
            fileName: 'main.[hash]',
        },
        minify: true,
        manifest: true,
        sourcemap: true,
        emptyOutDir: true,
    },
})
