import { expect, test } from '@playwright/test'

test.describe('Mock Authentication API', () => {
  const API_BASE = process.env.API_URL || 'http://localhost:5173/api'

  test('POST /api/auth/mock-login accepts "Il Keun Lee" and returns success', async ({ request }) => {
    const response = await request.post(`${API_BASE}/auth/mock-login`, {
      data: {
        name: 'Il Keun Lee'
      }
    })

    expect(response.ok()).toBeTruthy()
    expect(response.status()).toBe(200)

    const body = await response.json()
    expect(body).toHaveProperty('token')
    expect(body).toHaveProperty('user')
    expect(body.user).toMatchObject({
      name: 'Il Keun Lee',
      role: 'owner'
    })
  })

  test('Mock login creates a session token', async ({ request }) => {
    const response = await request.post(`${API_BASE}/auth/mock-login`, {
      data: {
        name: 'Il Keun Lee'
      }
    })

    const body = await response.json()
    expect(body.token).toBeTruthy()
    expect(typeof body.token).toBe('string')
    expect(body.token.length).toBeGreaterThan(0)
  })

  test('Invalid/empty name returns 400 error', async ({ request }) => {
    // Test empty name
    const emptyResponse = await request.post(`${API_BASE}/auth/mock-login`, {
      data: {
        name: ''
      }
    })

    expect(emptyResponse.status()).toBe(400)
    const emptyBody = await emptyResponse.json()
    expect(emptyBody).toHaveProperty('error')

    // Test missing name field
    const missingResponse = await request.post(`${API_BASE}/auth/mock-login`, {
      data: {}
    })

    expect(missingResponse.status()).toBe(400)
    const missingBody = await missingResponse.json()
    expect(missingBody).toHaveProperty('error')
  })

  test('Session persists across requests', async ({ request }) => {
    // First, login
    const loginResponse = await request.post(`${API_BASE}/auth/mock-login`, {
      data: {
        name: 'Il Keun Lee'
      }
    })

    const { token } = await loginResponse.json()

    // Then, make authenticated request
    const dashboardResponse = await request.get(`${API_BASE}/dashboard`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    expect(dashboardResponse.ok()).toBeTruthy()
  })

  test('Logout clears session', async ({ request }) => {
    // First, login
    const loginResponse = await request.post(`${API_BASE}/auth/mock-login`, {
      data: {
        name: 'Il Keun Lee'
      }
    })

    const { token } = await loginResponse.json()

    // Then, logout
    const logoutResponse = await request.post(`${API_BASE}/auth/logout`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    expect(logoutResponse.ok()).toBeTruthy()

    // Try to access protected route
    const dashboardResponse = await request.get(`${API_BASE}/dashboard`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    expect(dashboardResponse.status()).toBe(401)
  })
})
