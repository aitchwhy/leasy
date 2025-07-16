import { Context, Next } from 'hono'
import { getCookie } from 'hono/cookie'
import { getSession } from '../auth'

export async function requireAuth(c: Context, next: Next) {
  const sessionId = getCookie(c, 'session')
  const session = getSession(sessionId)

  if (!session || !session.user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  c.set('user', session.user)
  c.set('session', session)
  
  await next()
}