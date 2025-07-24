import { MockLoginRequestSchema, type MockLoginResponse } from '@/shared/types';
import { Hono } from 'hono';

const app = new Hono()

// Simple in-memory session store
const sessions = new Map<string, { user: { name: string; role: string }; expiresAt: number }>()

// Generate simple token
function generateToken(): string {
  return `mock-token-${Date.now()}-${Math.random().toString(36).substring(2)}`
}

// Mock login endpoint
app.post('/mock-login', async (c) => {
  try {
    const body = await c.req.json()
    const parsed = MockLoginRequestSchema.safeParse(body)

    if (!parsed.success) {
      return c.json({ error: 'Invalid request', details: parsed.error.flatten() }, 400)
    }

    const { name } = parsed.data

    // For MVP, only accept "Il Keun Lee"
    if (name !== 'Il Keun Lee') {
      return c.json({ error: 'User not found' }, 404)
    }

    // Generate token and store session
    const token = generateToken()
    const user = { name, role: 'owner' }

    sessions.set(token, {
      user,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    })

    const response: MockLoginResponse = {
      token,
      user
    }

    return c.json(response)
  } catch (error) {
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// Logout endpoint
app.post('/logout', async (c) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'No token provided' }, 401)
  }

  const token = authHeader.substring(7)
  sessions.delete(token)

  return c.json({ message: 'Logged out successfully' })
})

// Middleware to check authentication
export function requireAuth(c: any, next: any): any {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const token = authHeader.substring(7)
  const session = sessions.get(token)

  if (!session || session.expiresAt < Date.now()) {
    sessions.delete(token)
    return c.json({ error: 'Unauthorized' }, 401)
  }

  // Add user to context
  c.set('user', session.user)
  return next()
}

export default app
