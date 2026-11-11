import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';
import 'dotenv/config';

const testDir = defineBddConfig({
  features: 'features/**/*.feature',
  steps: [
    'src/config/fixtures.ts',
    'src/step-definitions/**/*.ts',
    'src/hooks/**/*.ts'
  ],
});

export default defineConfig({
  testDir,

  timeout: 30000,
  expect: {
    timeout: 10000
  },

  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,

  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/html-report', open: 'never' }]
  ],

  use: {
    baseURL: process.env.BASE_URL || 'https://www.saucedemo.com/',
    headless: false,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure'
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
});