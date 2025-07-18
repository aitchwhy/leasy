import { Page, Locator } from '@playwright/test'

export abstract class BasePage {
  constructor(protected page: Page) {}

  /**
   * Navigate to a specific path
   */
  async navigate(path: string) {
    await this.page.goto(path)
  }

  /**
   * Wait for page to be fully loaded
   */
  async waitForLoadState() {
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Get page title
   */
  async getTitle(): Promise<string> {
    return await this.page.title()
  }

  /**
   * Check if element is visible
   */
  async isVisible(locator: Locator): Promise<boolean> {
    return await locator.isVisible()
  }

  /**
   * Wait for element to be visible
   */
  async waitForVisible(locator: Locator, timeout?: number) {
    await locator.waitFor({ state: 'visible', timeout })
  }

  /**
   * Click element with retry
   */
  async clickElement(locator: Locator) {
    await locator.click()
  }

  /**
   * Fill input field
   */
  async fillInput(locator: Locator, value: string) {
    await locator.fill(value)
  }

  /**
   * Get text content
   */
  async getText(locator: Locator): Promise<string> {
    return await locator.textContent() || ''
  }

  /**
   * Take screenshot for debugging
   */
  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `tests/screenshots/${name}.png` })
  }

  /**
   * Get current URL
   */
  async getCurrentUrl(): Promise<string> {
    return this.page.url()
  }

  /**
   * Wait for navigation
   */
  async waitForNavigation(url?: string | RegExp) {
    if (url) {
      await this.page.waitForURL(url)
    } else {
      await this.page.waitForLoadState('domcontentloaded')
    }
  }
}