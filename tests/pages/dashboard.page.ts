import { Page, Locator } from '@playwright/test'
import { BasePage } from './base.page'

export class DashboardPage extends BasePage {
  // Metric card locators
  private readonly outstandingInvoicesCard: Locator
  private readonly monthlyRevenueCard: Locator
  private readonly occupancyRateCard: Locator
  private readonly totalTenantsCard: Locator

  // Quick action button locators
  private readonly generateInvoiceButton: Locator
  private readonly addTenantButton: Locator
  private readonly viewAllInvoicesButton: Locator

  // Navigation locators
  private readonly dashboardLink: Locator
  private readonly invoicesLink: Locator
  private readonly tenantsLink: Locator
  private readonly buildingsLink: Locator

  // User menu locators
  private readonly userMenuButton: Locator
  private readonly logoutMenuItem: Locator

  // Page elements
  private readonly pageHeading: Locator

  constructor(page: Page) {
    super(page)
    
    // Initialize metric card locators
    this.outstandingInvoicesCard = page.locator('text=Outstanding Invoices').locator('..')
    this.monthlyRevenueCard = page.locator('text=Monthly Revenue').locator('..')
    this.occupancyRateCard = page.locator('text=Occupancy Rate').locator('..')
    this.totalTenantsCard = page.locator('text=Total Tenants').locator('..')

    // Initialize quick action buttons
    this.generateInvoiceButton = page.getByRole('button', { name: /Generate Invoice/i })
    this.addTenantButton = page.getByRole('button', { name: /Add Tenant/i })
    this.viewAllInvoicesButton = page.getByRole('button', { name: /View All Invoices/i })

    // Initialize navigation
    this.dashboardLink = page.getByRole('link', { name: /Dashboard/i })
    this.invoicesLink = page.getByRole('link', { name: /Invoices/i })
    this.tenantsLink = page.getByRole('link', { name: /Tenants/i })
    this.buildingsLink = page.getByRole('link', { name: /Buildings/i })

    // Initialize user menu
    this.userMenuButton = page.getByRole('button', { name: /U/i }) // Avatar button
    this.logoutMenuItem = page.getByRole('menuitem', { name: /Log out/i })

    // Initialize page elements
    this.pageHeading = page.getByRole('heading', { name: /Dashboard/i })
  }

  /**
   * Navigate to dashboard
   */
  async goto() {
    await this.navigate('/dashboard')
    await this.waitForLoadState()
  }

  /**
   * Check if dashboard is displayed
   */
  async isDashboardDisplayed(): Promise<boolean> {
    return await this.isVisible(this.pageHeading)
  }

  /**
   * Get metric values
   */
  async getMetrics() {
    return {
      outstandingInvoices: await this.getMetricValue(this.outstandingInvoicesCard),
      monthlyRevenue: await this.getMetricValue(this.monthlyRevenueCard),
      occupancyRate: await this.getMetricValue(this.occupancyRateCard),
      totalTenants: await this.getMetricValue(this.totalTenantsCard),
    }
  }

  /**
   * Get metric value from card
   */
  private async getMetricValue(card: Locator): Promise<string> {
    const valueElement = card.locator('.text-2xl')
    return await this.getText(valueElement)
  }

  /**
   * Click generate invoice button
   */
  async clickGenerateInvoice() {
    await this.clickElement(this.generateInvoiceButton)
    await this.page.waitForURL('/invoices/new')
  }

  /**
   * Click add tenant button
   */
  async clickAddTenant() {
    await this.clickElement(this.addTenantButton)
  }

  /**
   * Click view all invoices button
   */
  async clickViewAllInvoices() {
    await this.clickElement(this.viewAllInvoicesButton)
  }

  /**
   * Navigate using top navigation
   */
  async navigateTo(section: 'dashboard' | 'invoices' | 'tenants' | 'buildings') {
    const links = {
      dashboard: this.dashboardLink,
      invoices: this.invoicesLink,
      tenants: this.tenantsLink,
      buildings: this.buildingsLink,
    }
    
    await this.clickElement(links[section])
  }

  /**
   * Log out
   */
  async logout() {
    await this.clickElement(this.userMenuButton)
    await this.clickElement(this.logoutMenuItem)
    await this.page.waitForURL('/login')
  }

  /**
   * Get recent invoices from table
   */
  async getRecentInvoices() {
    const rows = await this.page.locator('tbody tr').all()
    const invoices = []
    
    for (const row of rows) {
      invoices.push({
        tenant: await row.locator('td:nth-child(1)').textContent(),
        date: await row.locator('td:nth-child(2)').textContent(),
        amount: await row.locator('td:nth-child(3)').textContent(),
        status: await row.locator('td:nth-child(4) span').textContent(),
      })
    }
    
    return invoices
  }
}