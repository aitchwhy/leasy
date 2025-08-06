import { test, expect } from "@playwright/test";

test("React app renders with Hello World", async ({ page }) => {
  await page.goto("/");

  // Should have the React app running
  await expect(page.locator("h1")).toHaveText("Hello World");

  // Should have a root div typical of React apps
  await expect(page.locator("#root")).toBeVisible();
});
