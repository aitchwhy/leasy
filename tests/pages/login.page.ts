import { Page, Locator } from '@playwright/test'
import { BasePage } from './base.page'

export class LoginPage extends BasePage {
  // Locators
  private readonly pageHeading: Locator
  private readonly googleSignInButton: Locator
  private readonly welcomeText: Locator
  private readonly subheadingText: Locator

  constructor(page: Page) {
    super(page)
    
    // Initialize locators
    this.pageHeading = page.getByRole('heading', { name: 'Welcome to Leasy' })
    this.googleSignInButton = page.getByRole('button', { name: /Sign in with Google/i })
    this.welcomeText = page.getByText('Welcome to Leasy')
    this.subheadingText = page.getByText('Sign in to manage your properties and invoices')
  }

  /**
   * Navigate to login page
   */
  async goto() {
    await this.navigate('/login')
    await this.waitForLoadState()
  }

  /**
   * Check if login page is displayed
   */
  async isLoginPageDisplayed(): Promise<boolean> {
    return await this.isVisible(this.pageHeading)
  }

  /**
   * Click Google sign in button
   */
  async clickGoogleSignIn() {
    await this.clickElement(this.googleSignInButton)
  }

  /**
   * Get welcome message text
   */
  async getWelcomeText(): Promise<string> {
    return await this.getText(this.welcomeText)
  }

  /**
   * Check if Google sign in button is visible
   */
  async isGoogleSignInButtonVisible(): Promise<boolean> {
    return await this.isVisible(this.googleSignInButton)
  }

  /**
   * Perform complete login flow
   */
  async login() {
    await this.clickGoogleSignIn()
    // After clicking, the mock auth will redirect to dashboard
    await this.page.waitForURL('/dashboard')
  }
}