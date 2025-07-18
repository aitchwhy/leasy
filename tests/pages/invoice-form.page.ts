import { Page, Locator } from '@playwright/test'
import { BasePage } from './base.page'

export class InvoiceFormPage extends BasePage {
  // Form field locators
  private readonly buildingSelect: Locator
  private readonly tenantSelect: Locator
  private readonly periodStartDatePicker: Locator
  private readonly periodEndDatePicker: Locator
  
  // Line item locators
  private readonly lineItemDescriptions: Locator
  private readonly lineItemAmounts: Locator
  private readonly addLineItemButton: Locator
  private readonly removeLineItemButtons: Locator
  
  // Action button locators
  private readonly previewButton: Locator
  private readonly generateButton: Locator
  
  // Other elements
  private readonly pageHeading: Locator
  private readonly totalAmount: Locator

  constructor(page: Page) {
    super(page)
    
    // Initialize form fields
    this.buildingSelect = page.locator('[id="building"]').locator('..')
    this.tenantSelect = page.locator('[id="tenant"]').locator('..')
    this.periodStartDatePicker = page.getByLabel('Period Start').locator('..')
    this.periodEndDatePicker = page.getByLabel('Period End').locator('..')
    
    // Initialize line items
    this.lineItemDescriptions = page.locator('input[id^="description-"]')
    this.lineItemAmounts = page.locator('input[id^="amount-"]')
    this.addLineItemButton = page.getByRole('button', { name: /Add Line Item/i })
    this.removeLineItemButtons = page.locator('button[aria-label*="Remove"]')
    
    // Initialize action buttons
    this.previewButton = page.getByRole('button', { name: /Preview/i })
    this.generateButton = page.getByRole('button', { name: /Generate/i })
    
    // Initialize other elements
    this.pageHeading = page.getByRole('heading', { name: /Generate Invoice/i })
    this.totalAmount = page.locator('text=Total Amount:').locator('..').locator('.text-2xl')
  }

  /**
   * Navigate to invoice form
   */
  async goto() {
    await this.navigate('/invoices/new')
    await this.waitForLoadState()
  }

  /**
   * Check if form is displayed
   */
  async isFormDisplayed(): Promise<boolean> {
    return await this.isVisible(this.pageHeading)
  }

  /**
   * Select building
   */
  async selectBuilding(buildingName: string) {
    await this.buildingSelect.click()
    await this.page.getByRole('option', { name: buildingName }).click()
  }

  /**
   * Select tenant
   */
  async selectTenant(tenantName: string) {
    await this.tenantSelect.click()
    await this.page.getByRole('option', { name: new RegExp(tenantName) }).click()
  }

  /**
   * Select period start date
   */
  async selectPeriodStart(date: Date) {
    await this.periodStartDatePicker.click()
    // Wait for calendar to open
    await this.page.waitForSelector('[role="dialog"]')
    
    const day = date.getDate().toString()
    await this.page.getByRole('gridcell', { name: day, exact: true }).click()
  }

  /**
   * Select period end date
   */
  async selectPeriodEnd(date: Date) {
    await this.periodEndDatePicker.click()
    // Wait for calendar to open
    await this.page.waitForSelector('[role="dialog"]')
    
    const day = date.getDate().toString()
    await this.page.getByRole('gridcell', { name: day, exact: true }).click()
  }

  /**
   * Fill line item
   */
  async fillLineItem(index: number, description: string, amount: number) {
    const descriptionInputs = await this.lineItemDescriptions.all()
    const amountInputs = await this.lineItemAmounts.all()
    
    if (descriptionInputs[index] && amountInputs[index]) {
      await descriptionInputs[index].fill(description)
      await amountInputs[index].fill(amount.toString())
    }
  }

  /**
   * Add new line item
   */
  async addLineItem() {
    await this.clickElement(this.addLineItemButton)
  }

  /**
   * Remove line item
   */
  async removeLineItem(index: number) {
    const buttons = await this.removeLineItemButtons.all()
    if (buttons[index]) {
      await buttons[index].click()
    }
  }

  /**
   * Get total amount
   */
  async getTotalAmount(): Promise<string> {
    return await this.getText(this.totalAmount)
  }

  /**
   * Click preview button
   */
  async clickPreview() {
    await this.clickElement(this.previewButton)
  }

  /**
   * Click generate button
   */
  async clickGenerate() {
    await this.clickElement(this.generateButton)
  }

  /**
   * Fill complete invoice form
   */
  async fillInvoiceForm(data: {
    building: string
    tenant: string
    periodStart: Date
    periodEnd: Date
    lineItems: Array<{ description: string; amount: number }>
  }) {
    // Select building and tenant
    await this.selectBuilding(data.building)
    await this.selectTenant(data.tenant)
    
    // Select dates
    await this.selectPeriodStart(data.periodStart)
    await this.selectPeriodEnd(data.periodEnd)
    
    // Fill line items
    for (let i = 0; i < data.lineItems.length; i++) {
      if (i > 0) {
        await this.addLineItem()
      }
      await this.fillLineItem(i, data.lineItems[i].description, data.lineItems[i].amount)
    }
  }

  /**
   * Generate invoice
   */
  async generateInvoice() {
    await this.clickGenerate()
    // Wait for success toast
    await this.page.waitForSelector('text=Invoice generated successfully')
  }
}