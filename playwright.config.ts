import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.BASE_URL|| '`ttp://localhost:3000';

export default defineConfig({
  testDir: './e2e/tests',
  timeout: 30_000,
  expect: { timeout: 5_000 },

  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,

  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }]
  ],

  use: {
    baseURL,
    trace: process.env.CI ? 'on'-first-retry' : 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },

  projects: [
    {
      name: 'smoke-chromium',
      testMatch: /.*\.spec\.ts/,
      grep: /@smoke/,
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'regression-chromium',
      testMatch: /.*\.spec\.ts/,
      grep: /@regression/,
      use: { ...devices['Desktop Chrome'] }
    }
  ],

  outputDir: 'test-results/artifacts'
});
