import { expect, test } from "@playwright/test";

test.describe("Dashboard API", () => {
  const API_BASE = process.env.API_URL || "http://localhost:5173/api";
  let authToken: string;

  test.beforeEach(async ({ request }) => {
    // Login before each test
    const loginResponse = await request.post(`${API_BASE}/auth/mock-login`, {
      data: {
        name: "Il Keun Lee",
      },
    });
    const loginData = await loginResponse.json();
    authToken = loginData.token;
  });

  test("GET /api/dashboard returns building data for logged-in user", async ({ request }) => {
    const response = await request.get(`${API_BASE}/dashboard`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty("building");
    expect(body).toHaveProperty("summary");
  });

  test("Dashboard shows PNL building information", async ({ request }) => {
    const response = await request.get(`${API_BASE}/dashboard`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const body = await response.json();
    expect(body.building).toMatchObject({
      id: "pnl-001",
      name: "PNL Building",
      address: "서울특별시 강남구 논현로 159길 17",
      owner: "Il Keun Lee",
    });
  });

  test("Dashboard calculates total monthly revenue correctly (₩27,333,581)", async ({
    request,
  }) => {
    const response = await request.get(`${API_BASE}/dashboard`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const body = await response.json();
    // The exact amount from the Excel sheet: ₩27,333,581
    expect(body.building.monthlyRevenue).toBe(27333581);
    expect(body.summary.totalMonthlyRevenue).toBe(27333581);
  });

  test("Dashboard shows correct tenant count (12 occupied units)", async ({ request }) => {
    const response = await request.get(`${API_BASE}/dashboard`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const body = await response.json();
    expect(body.building.totalUnits).toBe(13);
    expect(body.building.occupiedUnits).toBe(12);
    expect(body.summary.totalTenants).toBe(12);
  });

  test("Unauthorized request returns 401 error", async ({ request }) => {
    // Request without token
    const response = await request.get(`${API_BASE}/dashboard`);

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body).toHaveProperty("error");
    expect(body.error).toBe("Unauthorized");
  });
});
