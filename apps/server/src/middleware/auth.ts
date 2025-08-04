import { Context, Next } from 'hono'
import { sessions } from '../api/auth'

export async function requireAuth(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  const token = authHeader.substring(7)
  const session = sessions.get(token)
  
  if (!session) {
    return c.json({ error: 'Invalid token' }, 401)
  }
  
  // Check if session is expired (24 hours)
  const expirationTime = 24 * 60 * 60 * 1000
  if (Date.now() - session.createdAt > expirationTime) {
    sessions.delete(token)
    return c.json({ error: 'Token expired' }, 401)
  }
  
  // Add user to context
  c.set('user', session.user)
  
  await next()
}