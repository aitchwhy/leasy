import { test, expect } from '@playwright/test'

test('dashboard API returns building data', async ({ request }) => {
  // First login to get token
  const loginResponse = await request.post('http://localhost:8787/api/auth/mock-login', {
    data: { name: 'Il Keun Lee' }
  })
  const { token } = await loginResponse.json()
  
  // Then get dashboard data
  const response = await request.get('http://localhost:8787/api/dashboard', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  
  expect(response.ok()).toBeTruthy()
  expect(response.status()).toBe(200)
  
  const body = await response.json()
  expect(body).toHaveProperty('building')
  expect(body.building).toMatchObject({
    name: 'PNL',
    owner: 'Il Keun Lee'
  })
  expect(body).toHaveProperty('metrics')
  expect(body.metrics).toHaveProperty('monthlyRevenue')
})