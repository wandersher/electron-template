import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        lib: {
            entry: ['src/electron/main.ts', 'src/electron/preload.ts'],
            fileName: (_, entryName) => `${entryName}.js`,
            formats: ['cjs'],
        },
        rollupOptions: {
            external: ['electron', ...require('module').builtinModules],
        },
    },
});
