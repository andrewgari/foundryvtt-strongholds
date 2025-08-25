import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    conditions: ['browser', 'module', 'default'],
  },
  define: {
    'import.meta.env.SSR': false,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: ['dist/**'],
    },
  },
});
