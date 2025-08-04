import { expect, test } from '@playwright/test'

test.describe('MVP User Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start fresh by clearing localStorage
    await page.goto('http://localhost:5173')
    await page.evaluate(() => localStorage.clear())
  })

  test('Complete user flow: Login → Dashboard → Generate Invoices', async ({ page }) => {
    // Step 1: Should redirect to login when not authenticated
    await page.goto('http://localhost:5173')
    await expect(page).toHaveURL('http://localhost:5173/login')

    // Step 2: Login page should have proper form
    await expect(page.locator('h1')).toContainText('Leasy 로그인')
    await expect(page.locator('label')).toContainText('이름')
    await expect(page.locator('input[type="text"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toContainText('로그인')

    // Step 3: Try invalid login
    await page.fill('input[type="text"]', 'Unknown User')
    await page.click('button[type="submit"]')

    // Should show error toast
    await expect(page.locator('.toast-error')).toBeVisible()

    // Step 4: Login with correct user
    await page.fill('input[type="text"]', 'Il Keun Lee')
    await page.click('button[type="submit"]')

    // Step 5: Should redirect to dashboard
    await expect(page).toHaveURL('http://localhost:5173/dashboard')

    // Step 6: Dashboard should show building info
    await expect(page.locator('h1')).toContainText('대시보드')
    await expect(page.locator('text=PNL Building')).toBeVisible()
    await expect(page.locator('text=서울특별시 강남구')).toBeVisible()

    // Step 7: Should show tenant count and revenue
    await expect(page.locator('text=12명')).toBeVisible() // 12 tenants
    await expect(page.locator('text=₩27,333,581')).toBeVisible() // Monthly revenue

    // Step 8: Navigate to invoice generation
    await page.click('text=청구서 생성')
    await expect(page).toHaveURL('http://localhost:5173/invoices/generate')

    // Step 9: Invoice generation page should have proper elements
    await expect(page.locator('h1')).toContainText('월별 청구서 생성')
    await expect(page.locator('select')).toBeVisible() // Period selector

    // Step 10: Should show all tenants with checkboxes
    const tenants = [
      '엠에스메디칼',
      '더열린정형외과',
      '엠에스치과',
      '서울더리얼피부과',
      '서울정형외과',
      '서울브레인신경과',
      '굿모닝소아청소년과의원',
      '미소로치과',
      '명성흉부외과의원',
      '더블유외과의원',
      '더좋은정형외과의원',
      '365탑비뇨의학과의원'
    ]

    for (const tenant of tenants) {
      await expect(page.locator(`text=${tenant}`)).toBeVisible()
    }

    // All checkboxes should be checked by default
    const checkboxes = await page.locator('input[type="checkbox"]').all()
    expect(checkboxes).toHaveLength(12)
    for (const checkbox of checkboxes) {
      await expect(checkbox).toBeChecked()
    }

    // Step 11: Select period and generate invoices
    await page.selectOption('select', '2025년 1월')

    // Uncheck a few tenants
    await page.locator('text=미소로치과').locator('..').locator('input[type="checkbox"]').uncheck()
    await page.locator('text=365탑비뇨의학과의원').locator('..').locator('input[type="checkbox"]').uncheck()

    // Generate invoices
    await page.click('button:has-text("청구서 생성")')

    // Step 12: Should show success message
    await expect(page.locator('text=10개의 청구서가 생성되었습니다')).toBeVisible()

    // Step 13: Verify invoice download works
    // Note: In real test, we'd verify download, but for UI test we just check the element exists
    const downloadButtons = await page.locator('button:has-text("PDF 다운로드")').all()
    expect(downloadButtons).toHaveLength(10) // 12 - 2 unchecked = 10

    // Step 14: Test logout
    await page.click('button:has-text("로그아웃")')
    await expect(page).toHaveURL('http://localhost:5173/login')

    // Step 15: Verify can't access protected pages after logout
    await page.goto('http://localhost:5173/dashboard')
    await expect(page).toHaveURL('http://localhost:5173/login')
  })

  test('Dashboard displays accurate financial data', async ({ page }) => {
    // Login first
    await page.goto('http://localhost:5173/login')
    await page.fill('input[type="text"]', 'Il Keun Lee')
    await page.click('button[type="submit"]')

    // Wait for dashboard
    await expect(page).toHaveURL('http://localhost:5173/dashboard')

    // Verify all key metrics are displayed
    await expect(page.locator('text=임대 가능 유닛')).toBeVisible()
    await expect(page.locator('text=12/12')).toBeVisible() // All units occupied

    await expect(page.locator('text=현재 임차인')).toBeVisible()
    await expect(page.locator('text=12명')).toBeVisible()

    await expect(page.locator('text=월 수익')).toBeVisible()
    await expect(page.locator('text=₩27,333,581')).toBeVisible()
  })

  test('Invoice generation calculates amounts correctly', async ({ page }) => {
    // Login and navigate to invoice generation
    await page.goto('http://localhost:5173/login')
    await page.fill('input[type="text"]', 'Il Keun Lee')
    await page.click('button[type="submit"]')

    await page.click('text=청구서 생성')

    // Generate invoice for just one tenant to verify calculation
    // Uncheck all except 서울브레인신경과 (301)
    const checkboxes = await page.locator('input[type="checkbox"]').all()
    for (let i = 0; i < checkboxes.length; i++) {
      await checkboxes[i].uncheck()
    }

    // Check only 서울브레인신경과
    await page.locator('text=서울브레인신경과').locator('..').locator('input[type="checkbox"]').check()

    await page.click('button:has-text("청구서 생성")')

    // Should show 1 invoice generated
    await expect(page.locator('text=1개의 청구서가 생성되었습니다')).toBeVisible()

    // Verify the amount shown
    // From Excel: Rent 3,500,000 + Electricity 144,692 + Water 29,159 + VAT = 4,023,851
    await expect(page.locator('text=₩4,023,851')).toBeVisible()
  })

  test('Responsive design works on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Login
    await page.goto('http://localhost:5173/login')
    await page.fill('input[type="text"]', 'Il Keun Lee')
    await page.click('button[type="submit"]')

    // Dashboard should be responsive
    await expect(page.locator('h1')).toContainText('대시보드')
    await expect(page.locator('.grid')).toHaveCSS('grid-template-columns', '1fr')

    // Navigate to invoice generation
    await page.click('text=청구서 생성')

    // Should still be functional on mobile
    await expect(page.locator('h1')).toContainText('월별 청구서 생성')
    await expect(page.locator('select')).toBeVisible()
  })
})
