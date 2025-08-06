import { expect, test } from "@playwright/test";

test.describe("Invoice Generation API", () => {
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

  test("POST /api/invoices/generate accepts period and tenant list", async ({ request }) => {
    const response = await request.post(`${API_BASE}/invoices/generate`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      data: {
        period: "2025년 5월",
        tenantIds: ["tenant-b102", "tenant-101"],
      },
    });

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body).toHaveProperty("invoices");
    expect(body).toHaveProperty("count");
    expect(body.count).toBe(2);
  });

  test("Generated invoice contains all required fields", async ({ request }) => {
    const response = await request.post(`${API_BASE}/invoices/generate`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      data: {
        period: "2025년 5월",
        tenantIds: ["tenant-301"], // 서울브레인신경과
      },
    });

    const body = await response.json();
    expect(body.invoices).toHaveLength(1);

    const invoice = body.invoices[0];
    expect(invoice).toHaveProperty("id");
    expect(invoice).toHaveProperty("tenantName");
    expect(invoice).toHaveProperty("amount");
    expect(invoice.tenantName).toBe("서울브레인신경과");
  });

  test("Invoice calculates rent + electricity + water correctly", async ({ request }) => {
    const response = await request.post(`${API_BASE}/invoices/generate`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      data: {
        period: "2025년 5월",
        tenantIds: ["tenant-301"], // Unit 301
      },
    });

    const body = await response.json();
    const invoice = body.invoices[0];

    // From Excel: 301 - 서울브레인신경과
    // Rent: 3,500,000 + Electricity: 144,692 + Water: 29,159 + VAT = 4,023,851
    expect(invoice.amount).toBe(4023851);
  });

  test("Multiple invoices can be generated in one request", async ({ request }) => {
    const response = await request.post(`${API_BASE}/invoices/generate`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      data: {
        period: "2025년 5월",
        tenantIds: ["tenant-b102", "tenant-101", "tenant-102", "tenant-201", "tenant-202"],
      },
    });

    const body = await response.json();
    expect(body.count).toBe(5);
    expect(body.invoices).toHaveLength(5);

    // Verify each invoice has correct structure
    body.invoices.forEach((invoice: any) => {
      expect(invoice.id).toBeTruthy();
      expect(invoice.tenantName).toBeTruthy();
      expect(invoice.amount).toBeGreaterThan(0);
    });
  });

  test("GET /api/invoices/{id}/pdf returns PDF file", async ({ request }) => {
    // First generate an invoice
    const generateResponse = await request.post(`${API_BASE}/invoices/generate`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      data: {
        period: "2025년 5월",
        tenantIds: ["tenant-301"],
      },
    });

    const { invoices } = await generateResponse.json();
    const invoiceId = invoices[0].id;

    // Then download the PDF
    const pdfResponse = await request.get(`${API_BASE}/invoices/${invoiceId}/pdf`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(pdfResponse.ok()).toBeTruthy();
    expect(pdfResponse.headers()["content-type"]).toBe("application/pdf");
    expect(pdfResponse.headers()["content-disposition"]).toContain(`invoice-${invoiceId}.pdf`);
  });
});
