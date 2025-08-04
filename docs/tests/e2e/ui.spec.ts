import { test, expect } from '@playwright/test'

test.describe('UI Acceptance Tests', () => {
  test('UI loads building list within 3 seconds', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/invoices/new')
    
    // Wait for building select to be enabled (indicates data loaded)
    const buildingSelect = page.locator('#building')
    await expect(buildingSelect).toBeEnabled({ timeout: 3000 })
    
    const loadTime = Date.now() - startTime
    
    // Verify load time is under 3 seconds (3000ms)
    expect(loadTime).toBeLessThan(3000)
    
    // Click on building select and verify buildings are displayed
    await buildingSelect.click()
    await expect(page.getByRole('option', { name: 'Main Plaza' })).toBeVisible()
    await expect(page.getByRole('option', { name: 'Tech Center' })).toBeVisible()
    await expect(page.getByRole('option', { name: 'West Tower' })).toBeVisible()
  })
  
  test('Invoice creation shows toast notification', async ({ page }) => {
    await page.goto('/invoices/new')
    
    // Select building
    await page.locator('#building').click()
    await page.getByRole('option', { name: 'Main Plaza' }).click()
    
    // Wait for tenants to load and select one
    await page.locator('#tenant').click()
    await page.getByRole('option', { name: 'ABC Corp' }).click()
    
    // Submit form
    await page.getByRole('button', { name: 'Generate Invoice' }).click()
    
    // Wait for toast notification
    await expect(page.getByText('Invoice created successfully')).toBeVisible({ timeout: 5000 })
    
    // Should show invoice ID in toast description
    await expect(page.getByText(/Invoice ID: inv-/)).toBeVisible()
  })
  
  test('Form populates lease data correctly', async ({ page }) => {
    await page.goto('/invoices/new')
    
    // Select building
    await page.locator('#building').click()
    await page.getByRole('option', { name: 'Main Plaza' }).click()
    
    // Select tenant
    await page.locator('#tenant').click()
    await page.getByRole('option', { name: 'ABC Corp' }).click()
    
    // Verify amount and description are populated
    const amountInput = page.locator('#amount')
    await expect(amountInput).toHaveValue('5000')
    
    const descriptionInput = page.locator('#description')
    await expect(descriptionInput).toHaveValue('Monthly Rent - ABC Corp')
  })
  
  test('Tenant dropdown is disabled until building is selected', async ({ page }) => {
    await page.goto('/invoices/new')
    
    // Initially tenant dropdown should be disabled
    const tenantTrigger = page.locator('#tenant')
    await expect(tenantTrigger).toBeDisabled()
    
    // Select building
    await page.locator('#building').click()
    await page.getByRole('option', { name: 'Tech Center' }).click()
    
    // Now tenant dropdown should be enabled
    await expect(tenantTrigger).toBeEnabled()
    
    // And should show tenants for selected building
    await tenantTrigger.click()
    await expect(page.getByRole('option', { name: 'Tech Startup Inc' })).toBeVisible()
    await expect(page.getByRole('option', { name: 'Innovation Labs' })).toBeVisible()
  })
  
  test('Form validation prevents submission without lease', async ({ page }) => {
    await page.goto('/invoices/new')
    
    // Try to submit without selecting anything
    const submitButton = page.getByRole('button', { name: 'Generate Invoice' })
    await expect(submitButton).toBeDisabled()
    
    // Select only building
    await page.locator('#building').click()
    await page.getByRole('option', { name: 'Main Plaza' }).click()
    
    // Submit should still be disabled
    await expect(submitButton).toBeDisabled()
    
    // Select tenant
    await page.locator('#tenant').click()
    await page.getByRole('option', { name: 'XYZ LLC' }).click()
    
    // Now submit should be enabled
    await expect(submitButton).toBeEnabled()
  })
})