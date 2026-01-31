import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'

const UCS_RUNTIME_MODE = 'ucs-runtime';

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
    plugins: [],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        },
    },
    build: {
        lib: {
            entry: fileURLToPath(new URL((mode === UCS_RUNTIME_MODE) ? './src/ucs-runtime.ts' : './src/main.ts', import.meta.url)),
            formats: (mode === UCS_RUNTIME_MODE ? ['iife'] : ['es']),
            fileName: 'main.[hash]',
            name: 'app'
        },
        minify: true,
        manifest: true,
        sourcemap: true,
        emptyOutDir: true,
        outDir: 'web/__/sandbox/' + ((mode === UCS_RUNTIME_MODE) ? 'runtime' : 'app'),
    },
}))
