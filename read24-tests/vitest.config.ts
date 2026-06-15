import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['unit/**/*.test.ts', 'contract/**/*.test.ts'],
    globals: false,
    environment: 'node',
  },
});
