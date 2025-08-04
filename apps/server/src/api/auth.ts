import { Hono } from 'hono'
import { z } from 'zod'

const auth = new Hono()

// In-memory session storage (for MVP)
const sessions = new Map<string, { user: any; createdAt: number }>()

const loginSchema = z.object({
  name: z.string().min(1)
})

auth.post('/mock-login', async (c) => {
  try {
    const body = await c.req.json()
    const parsed = loginSchema.parse(body)
    
    if (parsed.name !== 'Il Keun Lee') {
      return c.json({ error: 'Invalid credentials' }, 401)
    }
    
    // Generate session token
    const token = crypto.randomUUID()
    const user = {
      id: '1',
      name: parsed.name,
      email: 'ilkeun@example.com',
      role: 'owner'
    }
    
    sessions.set(token, {
      user,
      createdAt: Date.now()
    })
    
    return c.json({ token, user })
  } catch (error) {
    return c.json({ error: 'Invalid request' }, 400)
  }
})

auth.post('/logout', async (c) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'No token provided' }, 401)
  }
  
  const token = authHeader.substring(7)
  sessions.delete(token)
  
  return c.json({ success: true })
})

export { auth, sessions }