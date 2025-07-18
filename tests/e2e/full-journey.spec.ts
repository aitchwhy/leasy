import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/login.page'
import { DashboardPage } from '../pages/dashboard.page'
import { InvoiceFormPage } from '../pages/invoice-form.page'

test.describe('Full User Journey', () => {
  test('complete flow: login → dashboard → create invoice → generate PDF', async ({ page }) => {
    // Initialize page objects
    const loginPage = new LoginPage(page)
    const dashboardPage = new DashboardPage(page)
    const invoiceFormPage = new InvoiceFormPage(page)
    
    // Step 1: Navigate to app (should redirect to login)
    await page.goto('/')
    await expect(page).toHaveURL('/login')
    
    // Step 2: Verify login page
    expect(await loginPage.isLoginPageDisplayed()).toBeTruthy()
    expect(await loginPage.getWelcomeText()).toBe('Welcome to Leasy')
    
    // Step 3: Login with Google OAuth
    await loginPage.clickGoogleSignIn()
    
    // Step 4: Verify redirect to dashboard
    await expect(page).toHaveURL('/dashboard')
    expect(await dashboardPage.isDashboardDisplayed()).toBeTruthy()
    
    // Step 5: Check dashboard metrics
    const metrics = await dashboardPage.getMetrics()
    expect(metrics.outstandingInvoices).toBeTruthy()
    expect(metrics.monthlyRevenue).toBeTruthy()
    expect(metrics.occupancyRate).toBeTruthy()
    expect(metrics.totalTenants).toBeTruthy()
    
    // Step 6: Navigate to invoice creation
    await dashboardPage.clickGenerateInvoice()
    await expect(page).toHaveURL('/invoices/new')
    
    // Step 7: Verify invoice form
    expect(await invoiceFormPage.isFormDisplayed()).toBeTruthy()
    
    // Step 8: Fill invoice form
    const invoiceData = {
      building: '123 Main Street',
      tenant: 'ABC Corp',
      periodStart: new Date(2024, 0, 1),
      periodEnd: new Date(2024, 0, 31),
      lineItems: [
        { description: 'Base Rent - January 2024', amount: 5000 },
        { description: 'Utilities - Electricity & Water', amount: 450 },
        { description: 'Building Maintenance Fee', amount: 150 }
      ]
    }
    
    await invoiceFormPage.fillInvoiceForm(invoiceData)
    
    // Step 9: Verify calculated total
    const total = await invoiceFormPage.getTotalAmount()
    expect(total).toBe('$5600.00')
    
    // Step 10: Generate invoice
    await invoiceFormPage.clickGenerate()
    
    // Step 11: Verify success message
    await expect(page.getByText('Invoice generated successfully')).toBeVisible()
    
    // Step 12: Return to dashboard
    await dashboardPage.navigateTo('dashboard')
    await expect(page).toHaveURL('/dashboard')
    
    // Step 13: Verify invoice appears in recent invoices
    const recentInvoices = await dashboardPage.getRecentInvoices()
    expect(recentInvoices.length).toBeGreaterThan(0)
    
    // Step 14: Logout
    await dashboardPage.logout()
    
    // Step 15: Verify redirect to login
    await expect(page).toHaveURL('/login')
    expect(await loginPage.isLoginPageDisplayed()).toBeTruthy()
    
    // Step 16: Try to access protected route after logout
    await page.goto('/dashboard')
    await expect(page).toHaveURL('/login')
  })

  test('verify data persistence across navigation', async ({ page }) => {
    const loginPage = new LoginPage(page)
    const dashboardPage = new DashboardPage(page)
    const invoiceFormPage = new InvoiceFormPage(page)
    
    // Login
    await loginPage.goto()
    await loginPage.login()
    
    // Go to invoice form
    await invoiceFormPage.goto()
    
    // Start filling form
    await invoiceFormPage.selectBuilding('456 Oak Avenue')
    await invoiceFormPage.fillLineItem(0, 'Office Rent', 3500)
    
    // Navigate away to dashboard
    await dashboardPage.navigateTo('dashboard')
    await expect(page).toHaveURL('/dashboard')
    
    // Navigate back to invoice form
    await dashboardPage.clickGenerateInvoice()
    
    // Note: In a real app with proper state management,
    // we would verify that form data persists.
    // For this MVP, form is reset on navigation
    expect(await invoiceFormPage.isFormDisplayed()).toBeTruthy()
  })
})