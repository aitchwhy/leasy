import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'bun run --filter @leasy/client dev',
      port: 5173,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'bun run --filter @leasy/server dev',
      port: 8787,
      reuseExistingServer: !process.env.CI,
    }
  ],
})