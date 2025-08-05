import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  // where to look for tests
  testDir: './tests/e2e',
  // run tests in parallel
  fullyParallel: true,
  // no retries on failed tests
  retries: 0,
  // limit the number of workers
  workers: 1,
  // reporter to use
  reporter: 'html',

  testIgnore: ['docs/**/*'],

  use: {
    // base URL to use in actions like `await page.goto('/')`
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // launch a web server during the tests
  webServer: [
    {
      command: 'bun run --filter @leasy/server dev',
      port: 3000,
      reuseExistingServer: true,
    },
  ],
})
