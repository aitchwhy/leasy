import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/login.page'
import { DashboardPage } from '../pages/dashboard.page'

test.describe('Dashboard', () => {
  let loginPage: LoginPage
  let dashboardPage: DashboardPage

  test.beforeEach(async ({ page }) => {
    // Initialize page objects
    loginPage = new LoginPage(page)
    dashboardPage = new DashboardPage(page)
    
    // Login before each test
    await loginPage.goto()
    await loginPage.login()
    await page.waitForURL('/dashboard')
  })

  test('should display dashboard with correct metrics', async ({ page }) => {
    // Dashboard should be displayed
    expect(await dashboardPage.isDashboardDisplayed()).toBeTruthy()
    
    // Check page title
    await expect(page).toHaveTitle(/Leasy - Dashboard/)
    
    // Get metrics
    const metrics = await dashboardPage.getMetrics()
    
    // Verify metrics are displayed (values from mock data)
    expect(metrics.outstandingInvoices).toBe('5')
    expect(metrics.monthlyRevenue).toContain('45,000')
    expect(metrics.occupancyRate).toBe('92%')
    expect(metrics.totalTenants).toBe('23')
  })

  test('should display recent invoices table', async ({ page }) => {
    // Get recent invoices
    const invoices = await dashboardPage.getRecentInvoices()
    
    // Should have at least 3 invoices
    expect(invoices.length).toBeGreaterThanOrEqual(3)
    
    // Check first invoice
    expect(invoices[0].tenant).toBe('ABC Corp')
    expect(invoices[0].amount).toContain('5,000')
    expect(invoices[0].status?.toLowerCase()).toBe('paid')
  })

  test('should navigate to invoice creation from quick action', async ({ page }) => {
    // Click generate invoice button
    await dashboardPage.clickGenerateInvoice()
    
    // Should navigate to invoice form
    await expect(page).toHaveURL('/invoices/new')
    await expect(page.getByRole('heading', { name: /Generate Invoice/i })).toBeVisible()
  })

  test('should display quick action buttons', async ({ page }) => {
    // Check all quick action buttons are visible
    const generateInvoiceBtn = page.getByRole('button', { name: /Generate Invoice/i })
    const addTenantBtn = page.getByRole('button', { name: /Add Tenant/i })
    const viewInvoicesBtn = page.getByRole('button', { name: /View All Invoices/i })
    
    await expect(generateInvoiceBtn).toBeVisible()
    await expect(addTenantBtn).toBeVisible()
    await expect(viewInvoicesBtn).toBeVisible()
  })

  test('should have working navigation menu', async ({ page }) => {
    // Check navigation links are visible
    const dashboardLink = page.getByRole('link', { name: /Dashboard/i })
    const invoicesLink = page.getByRole('link', { name: /Invoices/i })
    const tenantsLink = page.getByRole('link', { name: /Tenants/i })
    const buildingsLink = page.getByRole('link', { name: /Buildings/i })
    
    await expect(dashboardLink).toBeVisible()
    await expect(invoicesLink).toBeVisible()
    await expect(tenantsLink).toBeVisible()
    await expect(buildingsLink).toBeVisible()
  })

  test('should display user menu with logout option', async ({ page }) => {
    // User avatar should be visible
    const userMenu = page.getByRole('button', { name: /U/i })
    await expect(userMenu).toBeVisible()
    
    // Click to open menu
    await userMenu.click()
    
    // Should show user info and logout option
    await expect(page.getByText('Demo User')).toBeVisible()
    await expect(page.getByText('demo@example.com')).toBeVisible()
    await expect(page.getByRole('menuitem', { name: /Log out/i })).toBeVisible()
  })
})