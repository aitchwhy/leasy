import { test, expect } from "@playwright/test";

test("mock login API accepts Il Keun Lee", async ({ request }) => {
  const response = await request.post("http://localhost:8787/api/auth/mock-login", {
    data: {
      name: "Il Keun Lee",
    },
  });

  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(200);

  const body = await response.json();
  expect(body).toHaveProperty("token");
  expect(body).toHaveProperty("user");
  expect(body.user).toMatchObject({
    name: "Il Keun Lee",
    role: "owner",
  });
});
