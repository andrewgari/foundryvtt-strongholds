import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import sveltePreprocess from 'svelte-preprocess';

export default {
  preprocess: [
    vitePreprocess(),
    sveltePreprocess({
      sourceMap: true,
      scss: {
        // You can add includePaths here if needed
      }
    })
  ]
};

