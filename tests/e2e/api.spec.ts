import { test, expect } from '@playwright/test'

test.describe('API Endpoints', () => {
  test('FR-01: GET /api/buildings returns building list', async ({ request }) => {
    const response = await request.get('/api/buildings')
    
    expect(response.status()).toBe(200)
    
    const buildings = await response.json()
    expect(Array.isArray(buildings)).toBe(true)
    expect(buildings.length).toBeGreaterThanOrEqual(1)
    
    // Verify building structure
    const building = buildings[0]
    expect(building).toHaveProperty('building_id')
    expect(building).toHaveProperty('name')
    expect(building).toHaveProperty('address')
  })
  
  test('FR-02: GET /api/leases returns leases for a building', async ({ request }) => {
    // First get buildings
    const buildingsResponse = await request.get('/api/buildings')
    const buildings = await buildingsResponse.json()
    const buildingId = buildings[0].building_id
    
    // Get leases for first building
    const response = await request.get(`/api/leases?building_id=${buildingId}`)
    
    expect(response.status()).toBe(200)
    
    const leases = await response.json()
    expect(Array.isArray(leases)).toBe(true)
    
    // Verify lease structure if we have leases
    if (leases.length > 0) {
      const lease = leases[0]
      expect(lease).toHaveProperty('lease_id')
      expect(lease).toHaveProperty('tenant_name')
      expect(lease).toHaveProperty('rent_amount')
    }
  })
  
  test('FR-02: GET /api/leases returns 404 for unknown building', async ({ request }) => {
    const response = await request.get('/api/leases?building_id=unknown-building')
    
    expect(response.status()).toBe(404)
    
    const error = await response.json()
    expect(error).toHaveProperty('error')
    expect(error.error).toContain('Unknown building')
  })
  
  test('FR-03: POST /api/invoices creates invoice with valid lease', async ({ request }) => {
    // First get a valid lease
    const buildingsResponse = await request.get('/api/buildings')
    const buildings = await buildingsResponse.json()
    const buildingId = buildings[0].building_id
    
    const leasesResponse = await request.get(`/api/leases?building_id=${buildingId}`)
    const leases = await leasesResponse.json()
    const leaseId = leases[0].lease_id
    
    // Create invoice
    const response = await request.post('/api/invoices', {
      data: {
        lease_id: leaseId
      }
    })
    
    expect(response.status()).toBe(201)
    
    const result = await response.json()
    expect(result).toHaveProperty('invoice_id')
    expect(result.invoice_id).toBeTruthy()
  })
  
  test('FR-03: POST /api/invoices returns 422 for invalid body', async ({ request }) => {
    const response = await request.post('/api/invoices', {
      data: {
        // Missing lease_id
      }
    })
    
    expect(response.status()).toBe(422)
    
    const error = await response.json()
    expect(error).toHaveProperty('error')
    expect(error.error).toContain('Validation failed')
  })
  
  test('FR-03: POST /api/invoices returns 404 for unknown lease', async ({ request }) => {
    const response = await request.post('/api/invoices', {
      data: {
        lease_id: 'unknown-lease-id'
      }
    })
    
    expect(response.status()).toBe(404)
    
    const error = await response.json()
    expect(error).toHaveProperty('error')
    expect(error.error).toContain('Unknown lease')
  })
  
  test('FR-04: GET /api/invoices/:id returns invoice details', async ({ request }) => {
    // First create an invoice
    const buildingsResponse = await request.get('/api/buildings')
    const buildings = await buildingsResponse.json()
    const buildingId = buildings[0].building_id
    
    const leasesResponse = await request.get(`/api/leases?building_id=${buildingId}`)
    const leases = await leasesResponse.json()
    const leaseId = leases[0].lease_id
    
    const createResponse = await request.post('/api/invoices', {
      data: {
        lease_id: leaseId
      }
    })
    const { invoice_id } = await createResponse.json()
    
    // Get the invoice
    const response = await request.get(`/api/invoices/${invoice_id}`)
    
    expect(response.status()).toBe(200)
    
    const invoice = await response.json()
    expect(invoice).toHaveProperty('invoice_id')
    expect(invoice).toHaveProperty('lines')
    expect(Array.isArray(invoice.lines)).toBe(true)
  })
  
  test('FR-04: GET /api/invoices/:id returns 404 for unknown invoice', async ({ request }) => {
    const response = await request.get('/api/invoices/unknown-invoice-id')
    
    expect(response.status()).toBe(404)
    
    const error = await response.json()
    expect(error).toHaveProperty('error')
    expect(error.error).toContain('Invoice not found')
  })
  
  test('FR-05: GET /api/healthz returns ok', async ({ request }) => {
    const response = await request.get('/api/healthz')
    
    expect(response.status()).toBe(200)
    
    const text = await response.text()
    expect(text).toBe('ok')
  })
})