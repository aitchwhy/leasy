# E2E Testing Guide

## Overview
This directory contains end-to-end tests for the Leasy invoice generator application using Playwright.

## Test Structure

```
tests/
├── e2e/                    # E2E test specifications
│   ├── auth.spec.ts       # Authentication flow tests
│   ├── dashboard.spec.ts  # Dashboard functionality tests
│   ├── invoice-generation.spec.ts  # Invoice creation tests
│   ├── full-journey.spec.ts      # Complete user journey tests
│   └── smoke.spec.ts      # Basic smoke tests
├── pages/                 # Page Object Model classes
│   ├── base.page.ts      # Base page class with common methods
│   ├── login.page.ts     # Login page interactions
│   ├── dashboard.page.ts # Dashboard page interactions
│   └── invoice-form.page.ts # Invoice form interactions
└── fixtures/             # Test data and utilities
    └── data/
        └── test-data.ts  # Centralized test data

```

## Running Tests

### Prerequisites
```bash
# Install Playwright browsers (one-time setup)
npx playwright install

# Install system dependencies (if needed)
npx playwright install-deps
```

### Run all tests
```bash
npm run test:e2e
```

### Run specific test file
```bash
npm run test:e2e tests/e2e/auth.spec.ts
```

### Run tests in UI mode
```bash
npm run test:e2e:ui
```

### Run tests with specific browser
```bash
npm run test:e2e -- --project=chromium
```

## Writing Tests

### Page Object Model
We use the Page Object Model pattern for maintainable tests:

```typescript
// pages/example.page.ts
export class ExamplePage extends BasePage {
  private readonly submitButton: Locator
  
  constructor(page: Page) {
    super(page)
    this.submitButton = page.getByRole('button', { name: 'Submit' })
  }
  
  async clickSubmit() {
    await this.clickElement(this.submitButton)
  }
}
```

### Test Structure
```typescript
test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
  })
  
  test('should do something', async ({ page }) => {
    // Arrange
    const loginPage = new LoginPage(page)
    
    // Act
    await loginPage.goto()
    await loginPage.login()
    
    // Assert
    await expect(page).toHaveURL('/dashboard')
  })
})
```

## Test Data

Test data is centralized in `fixtures/data/test-data.ts`:
- Mock users
- Sample buildings
- Sample tenants
- Sample invoices

## Authentication

The application uses a mock authentication system for testing:
- Mock Google OAuth flow
- Session-based authentication
- Automatic login helper in page objects

## Best Practices

1. **Use Page Objects**: Encapsulate page interactions
2. **Descriptive Names**: Use clear, descriptive test names
3. **Independent Tests**: Each test should be independent
4. **Wait Strategies**: Use Playwright's auto-waiting
5. **Assertions**: Use explicit assertions
6. **Screenshots**: Take screenshots on failure

## Debugging

### View test report
```bash
npx playwright show-report
```

### Debug specific test
```bash
npm run test:e2e -- --debug tests/e2e/auth.spec.ts
```

### Use VS Code extension
Install the Playwright Test for VS Code extension for better debugging experience.

## CI/CD Integration

Tests are configured to run in CI with:
- Parallel execution disabled in CI
- Retries on failure
- HTML report generation

## Common Issues

### Browser not installed
```bash
npx playwright install chromium
```

### Port already in use
The dev server runs on port 5173. Make sure it's not already running.

### Flaky tests
- Use proper wait strategies
- Avoid hard-coded timeouts
- Check for race conditions

## Future Improvements

- [ ] Add visual regression tests
- [ ] Implement API mocking with MSW
- [ ] Add performance testing
- [ ] Create more test fixtures
- [ ] Add accessibility tests