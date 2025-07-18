import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/login.page'
import { InvoiceFormPage } from '../pages/invoice-form.page'

test.describe('Invoice Generation', () => {
  let loginPage: LoginPage
  let invoiceFormPage: InvoiceFormPage

  test.beforeEach(async ({ page }) => {
    // Initialize page objects
    loginPage = new LoginPage(page)
    invoiceFormPage = new InvoiceFormPage(page)
    
    // Login and navigate to invoice form
    await loginPage.goto()
    await loginPage.login()
    await page.waitForURL('/dashboard')
    await invoiceFormPage.goto()
  })

  test('should display invoice form with all fields', async ({ page }) => {
    // Form should be displayed
    expect(await invoiceFormPage.isFormDisplayed()).toBeTruthy()
    
    // Check page title
    await expect(page).toHaveTitle(/Leasy - Generate Invoice/)
    
    // Check all form fields are present
    await expect(page.getByLabel(/Building/i)).toBeVisible()
    await expect(page.getByLabel(/Tenant/i)).toBeVisible()
    await expect(page.getByLabel(/Period Start/i)).toBeVisible()
    await expect(page.getByLabel(/Period End/i)).toBeVisible()
    
    // Check default line item
    await expect(page.locator('input[id^="description-"]').first()).toBeVisible()
    await expect(page.locator('input[id^="amount-"]').first()).toBeVisible()
    
    // Check action buttons
    await expect(page.getByRole('button', { name: /Preview/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Generate/i })).toBeVisible()
  })

  test('should calculate total amount in real-time', async ({ page }) => {
    // Fill first line item
    await invoiceFormPage.fillLineItem(0, 'Base Rent', 5000)
    
    // Check total
    let total = await invoiceFormPage.getTotalAmount()
    expect(total).toBe('$5000.00')
    
    // Add another line item
    await invoiceFormPage.addLineItem()
    await invoiceFormPage.fillLineItem(1, 'Utilities', 500)
    
    // Check updated total
    total = await invoiceFormPage.getTotalAmount()
    expect(total).toBe('$5500.00')
  })

  test('should allow adding and removing line items', async ({ page }) => {
    // Initially should have 1 line item
    let lineItems = await page.locator('input[id^="description-"]').count()
    expect(lineItems).toBe(1)
    
    // Add a line item
    await invoiceFormPage.addLineItem()
    lineItems = await page.locator('input[id^="description-"]').count()
    expect(lineItems).toBe(2)
    
    // Add another
    await invoiceFormPage.addLineItem()
    lineItems = await page.locator('input[id^="description-"]').count()
    expect(lineItems).toBe(3)
    
    // Remove the second line item
    await invoiceFormPage.removeLineItem(1)
    lineItems = await page.locator('input[id^="description-"]').count()
    expect(lineItems).toBe(2)
  })

  test('should fill and submit complete invoice form', async ({ page }) => {
    // Create test data
    const invoiceData = {
      building: '123 Main Street',
      tenant: 'ABC Corp',
      periodStart: new Date(2024, 0, 1), // Jan 1, 2024
      periodEnd: new Date(2024, 0, 31), // Jan 31, 2024
      lineItems: [
        { description: 'Base Rent', amount: 5000 },
        { description: 'Utilities', amount: 500 },
        { description: 'Maintenance', amount: 200 }
      ]
    }
    
    // Fill the form
    await invoiceFormPage.fillInvoiceForm(invoiceData)
    
    // Verify total
    const total = await invoiceFormPage.getTotalAmount()
    expect(total).toBe('$5700.00')
    
    // Generate invoice
    await invoiceFormPage.generateInvoice()
    
    // Should show success message
    await expect(page.getByText('Invoice generated successfully')).toBeVisible()
  })

  test('should show preview when preview button is clicked', async ({ page }) => {
    // Fill basic data
    await invoiceFormPage.selectBuilding('123 Main Street')
    await invoiceFormPage.selectTenant('ABC Corp')
    await invoiceFormPage.fillLineItem(0, 'Base Rent', 5000)
    
    // Click preview
    await invoiceFormPage.clickPreview()
    
    // Should show preview notification (as per current implementation)
    await expect(page.getByText('Preview functionality coming soon!')).toBeVisible()
  })

  test('should require building and tenant selection', async ({ page }) => {
    // Try to generate without selecting building/tenant
    await invoiceFormPage.fillLineItem(0, 'Base Rent', 5000)
    await invoiceFormPage.clickGenerate()
    
    // Should not generate (form validation should prevent it)
    // In a real app, we'd check for validation messages
    const successMessage = page.getByText('Invoice generated successfully')
    await expect(successMessage).not.toBeVisible({ timeout: 2000 })
  })
})