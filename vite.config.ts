import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

const page = (name: string) => fileURLToPath(new URL(name, import.meta.url));

export default defineConfig({
  base: './',
  build: {
    target: 'es2022',
    rollupOptions: {
      input: {
        main: page('./index.html'),
        leaderboard: page('./leaderboard.html'),
      },
    },
  },
  test: {
    include: ['test/**/*.test.ts'],
    testTimeout: 120000,
  },
});
