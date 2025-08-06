import { expect, test } from "@playwright/test";

test.describe("Tenants API", () => {
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

  test("GET /api/tenants returns all PNL building tenants", async ({ request }) => {
    const response = await request.get(`${API_BASE}/tenants`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const tenants = await response.json();
    expect(Array.isArray(tenants)).toBeTruthy();
    expect(tenants.length).toBe(12); // 12 occupied units
  });

  test("Each tenant has correct unit number, name, and business number", async ({ request }) => {
    const response = await request.get(`${API_BASE}/tenants`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const tenants = await response.json();

    // Check first tenant (B102 - 디아삽)
    const firstTenant = tenants.find((t: any) => t.unit === "B102");
    expect(firstTenant).toMatchObject({
      unit: "B102",
      name: "디아삽",
      businessNumber: "211-10-21870",
    });
  });

  test("Tenant data matches Excel sheet values exactly", async ({ request }) => {
    const response = await request.get(`${API_BASE}/tenants`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const tenants = await response.json();

    // Check specific tenant data from Excel
    const tenant301 = tenants.find((t: any) => t.unit === "301");
    expect(tenant301).toMatchObject({
      unit: "301",
      name: "서울브레인신경과",
      businessNumber: "211-90-68256",
      monthlyRent: 3500000,
      electricityCharge: 144692,
      waterCharge: 29159,
    });
  });

  test("Rent amounts are accurate for each unit", async ({ request }) => {
    const response = await request.get(`${API_BASE}/tenants`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const tenants = await response.json();

    // Verify rent amounts for several units
    const rentAmounts = {
      B102: 2080000,
      "101": 2918710,
      "102": 1620000,
      "201": 1890000,
      "202": 2000000,
    };

    Object.entries(rentAmounts).forEach(([unit, expectedRent]) => {
      const tenant = tenants.find((t: any) => t.unit === unit);
      expect(tenant.monthlyRent).toBe(expectedRent);
    });
  });

  test("VAT is calculated as 10% of rent", async ({ request }) => {
    const response = await request.get(`${API_BASE}/tenants`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const tenants = await response.json();

    // Check VAT calculation for each tenant
    tenants.forEach((tenant: any) => {
      const expectedVat = Math.round(tenant.monthlyRent * 0.1);
      expect(tenant.vat).toBe(expectedVat);
    });
  });
});
