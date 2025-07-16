import { test, expect } from '@playwright/test'

test.describe('Smoke Test', () => {
  test('app loads successfully', async ({ page }) => {
    await page.goto('/')
    
    // App should load
    await expect(page).toHaveTitle(/Leasy/)
    
    // Should redirect to login if not authenticated
    await expect(page).toHaveURL(/\/login/)
  })

  test('login page has Google OAuth button', async ({ page }) => {
    await page.goto('/login')
    
    // Should have Google login button
    const googleButton = page.getByRole('button', { name: /Sign in with Google/i })
    await expect(googleButton).toBeVisible()
  })

  test('authenticated user can access dashboard', async ({ page }) => {
    // Mock authentication for test
    await page.goto('/dashboard')
    
    // Should show dashboard elements
    await expect(page.getByRole('heading', { name: /Dashboard/i })).toBeVisible()
    
    // Should have quick action buttons
    await expect(page.getByRole('button', { name: /Generate Invoice/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Add Tenant/i })).toBeVisible()
  })

  test('invoice generation flow', async ({ page }) => {
    await page.goto('/invoices/new')
    
    // Should show invoice form
    await expect(page.getByRole('heading', { name: /Generate Invoice/i })).toBeVisible()
    
    // Should have form fields
    await expect(page.getByLabel(/Building/i)).toBeVisible()
    await expect(page.getByLabel(/Tenant/i)).toBeVisible()
    await expect(page.getByLabel(/Period Start/i)).toBeVisible()
    await expect(page.getByLabel(/Period End/i)).toBeVisible()
    
    // Should have action buttons
    await expect(page.getByRole('button', { name: /Preview/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Generate/i })).toBeVisible()
  })
})