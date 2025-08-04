import { test, expect } from '@playwright/test'

test('displays exactly Hello World', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1')).toHaveText('Hello World')
})