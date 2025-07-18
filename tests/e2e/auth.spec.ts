import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/login.page'
import { DashboardPage } from '../pages/dashboard.page'

test.describe('Authentication', () => {
  let loginPage: LoginPage
  let dashboardPage: DashboardPage

  test.beforeEach(async ({ page }) => {
    // Initialize page objects
    loginPage = new LoginPage(page)
    dashboardPage = new DashboardPage(page)
  })

  test('should display login page for unauthenticated users', async ({ page }) => {
    // Navigate to root
    await page.goto('/')
    
    // Should redirect to login
    await expect(page).toHaveURL('/login')
    
    // Login page should be displayed
    expect(await loginPage.isLoginPageDisplayed()).toBeTruthy()
    expect(await loginPage.isGoogleSignInButtonVisible()).toBeTruthy()
  })

  test('should allow user to sign in with Google OAuth', async ({ page }) => {
    // Go to login page
    await loginPage.goto()
    
    // Click Google sign in
    await loginPage.clickGoogleSignIn()
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard')
    
    // Dashboard should be displayed
    expect(await dashboardPage.isDashboardDisplayed()).toBeTruthy()
  })

  test('should persist authentication across page reloads', async ({ page, context }) => {
    // Login first
    await loginPage.goto()
    await loginPage.login()
    
    // Verify on dashboard
    await expect(page).toHaveURL('/dashboard')
    
    // Reload page
    await page.reload()
    
    // Should still be on dashboard
    await expect(page).toHaveURL('/dashboard')
    expect(await dashboardPage.isDashboardDisplayed()).toBeTruthy()
    
    // Check session cookie exists
    const cookies = await context.cookies()
    const sessionCookie = cookies.find(c => c.name === 'session')
    expect(sessionCookie).toBeDefined()
    expect(sessionCookie?.value).toMatch(/^test-session-/)
  })

  test('should protect dashboard route from unauthenticated access', async ({ page }) => {
    // Try to access dashboard directly without auth
    await page.goto('/dashboard')
    
    // Should redirect to login
    await expect(page).toHaveURL('/login')
    expect(await loginPage.isLoginPageDisplayed()).toBeTruthy()
  })

  test('should protect invoice form route from unauthenticated access', async ({ page }) => {
    // Try to access invoice form directly without auth
    await page.goto('/invoices/new')
    
    // Should redirect to login
    await expect(page).toHaveURL('/login')
    expect(await loginPage.isLoginPageDisplayed()).toBeTruthy()
  })

  test('should allow user to log out', async ({ page, context }) => {
    // Login first
    await loginPage.goto()
    await loginPage.login()
    
    // Verify on dashboard
    await expect(page).toHaveURL('/dashboard')
    
    // Log out
    await dashboardPage.logout()
    
    // Should redirect to login
    await expect(page).toHaveURL('/login')
    expect(await loginPage.isLoginPageDisplayed()).toBeTruthy()
    
    // Session cookie should be cleared
    const cookies = await context.cookies()
    const sessionCookie = cookies.find(c => c.name === 'session')
    expect(sessionCookie?.value).toBe('')
  })

  test('should redirect authenticated users from login to dashboard', async ({ page }) => {
    // Login first
    await loginPage.goto()
    await loginPage.login()
    
    // Try to access login page again
    await page.goto('/login')
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard')
    expect(await dashboardPage.isDashboardDisplayed()).toBeTruthy()
  })
})