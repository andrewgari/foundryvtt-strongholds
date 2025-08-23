import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'node:path';

export default defineConfig(({ mode }) => ({
  plugins: [svelte()],
  resolve: {
    alias: {
      '@apps': path.resolve(__dirname, 'src/apps'),
      '@foundry': path.resolve(__dirname, 'src/foundry'),
      '@styles': path.resolve(__dirname, 'src/styles')
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    lib: {
      entry: path.resolve(__dirname, 'src/main.ts'),
      formats: ['es'],
      fileName: () => 'main.js'
    },
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) return 'styles.css';
          if (assetInfo.name === 'module.json') return 'module.json';
          return 'assets/[name][extname]';
        }
      }
    }
  },
  publicDir: 'static',
  base: './'
}));

