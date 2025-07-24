import { test, expect } from '@playwright/test'

test.describe('Smoke Test', () => {
  test('app loads successfully', async ({ page }) => {
    await page.goto('/')
    
    // App should load and redirect to dashboard
    await expect(page).toHaveURL('/dashboard')
    
    // Should have proper title
    await expect(page).toHaveTitle(/Leasy/)
    
    // Should have header with logo
    await expect(page.getByText('Leasy')).toBeVisible()
  })

  test('dashboard shows mock data', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Should show dashboard title
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
    
    // Should show stats cards
    await expect(page.getByText('Outstanding Invoices')).toBeVisible()
    await expect(page.getByText('Monthly Revenue')).toBeVisible()
    
    // Should show invoice table
    await expect(page.getByText('Recent Invoices')).toBeVisible()
    await expect(page.getByText('ABC Corp')).toBeVisible()
  })

  test('can navigate to invoice form', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Click new invoice button in the card (not in header)
    await page.getByRole('main').getByRole('link', { name: 'New Invoice' }).click()
    
    // Should navigate to invoice form
    await expect(page).toHaveURL('/invoices/new')
    await expect(page.getByRole('heading', { name: 'Generate Invoice' })).toBeVisible()
  })
})