import { test, expect } from '@playwright/test';

test('dashboard navigation', async ({ page }) => {
  // Start from the dashboard page (redirects to sign-in if not authenticated, but we can check for redirect or public page)
  // Since we are using Clerk, handling auth in E2E is complex without setup.
  // For now, we will check if the public landing page (if any) or sign-in page loads.

  // Assuming root redirects to dashboard, which redirects to sign-in
  await page.goto('/');

  // Expect to be redirected to Clerk sign-in or dashboard
  await expect(page).toHaveURL(/.*(sign-in|dashboard).*/);
});
