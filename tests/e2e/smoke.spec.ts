import { test, expect } from '@playwright/test'

test.describe('Smoke Test', () => {
  test('app loads successfully', async ({ page }) => {
    await page.goto('/')
    
    // App should load and redirect to dashboard (server-side redirect)
    await expect(page).toHaveURL('/dashboard')
    
    // Should have proper title
    await expect(page).toHaveTitle(/Leasy/)
  })

  test('login page has Google OAuth button', async ({ page }) => {
    await page.goto('/login')
    
    // Should have Google login button
    const googleButton = page.getByRole('button', { name: /Sign in with Google/i })
    await expect(googleButton).toBeVisible()
  })

  test('unauthenticated user cannot access dashboard', async ({ page }) => {
    // Go directly to dashboard
    await page.goto('/dashboard')
    
    // Wait for client-side redirect to login
    await page.waitForURL('/login', { timeout: 5000 })
    await expect(page).toHaveURL('/login')
  })

  test('invoice generation flow redirects to login when unauthenticated', async ({ page }) => {
    await page.goto('/invoices/new')
    
    // Should redirect to login page for unauthenticated users
    await page.waitForURL('/login', { timeout: 5000 })
    await expect(page).toHaveURL('/login')
  })
})