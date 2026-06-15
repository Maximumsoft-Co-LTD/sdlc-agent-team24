import { defineConfig } from '@playwright/test';

const baseURL = process.env.READ24_API_URL ?? 'http://localhost:3000';

export default defineConfig({
  testDir: '.',
  testMatch: ['api-tests/**/*.api.spec.ts', 'e2e/**/*.spec.ts'],
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL,
    extraHTTPHeaders: {
      Accept: 'application/json',
    },
  },
});
