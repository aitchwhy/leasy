import { Hono } from 'hono'
import { getCookie, setCookie } from 'hono/cookie'

// Simplified auth implementation for MVP
const authApp = new Hono()

// Mock session store
const sessions = new Map<string, any>()

authApp.get('/google', (c) => {
  // In production, this would redirect to Google OAuth
  // For now, create a mock session
  const mockUser = {
    id: 'user123',
    email: 'demo@example.com',
    name: 'Demo User',
    picture: 'https://via.placeholder.com/150',
  }
  
  const sessionId = Math.random().toString(36).substring(7)
  sessions.set(sessionId, { user: mockUser })
  
  // Set cookie and redirect
  setCookie(c, 'session', sessionId, {
    httpOnly: true,
    secure: false, // Set to true in production
    sameSite: 'Lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
  
  return c.redirect('/dashboard')
})

authApp.get('/signout', (c) => {
  const sessionId = getCookie(c, 'session')
  if (sessionId) {
    sessions.delete(sessionId)
  }
  
  setCookie(c, 'session', '', {
    httpOnly: true,
    maxAge: 0,
  })
  
  return c.redirect('/login')
})

authApp.get('/session', (c) => {
  const sessionId = getCookie(c, 'session')
  if (!sessionId || !sessions.has(sessionId)) {
    return c.json({ user: null })
  }
  
  const session = sessions.get(sessionId)
  return c.json(session)
})

export const authHandler = authApp
export const getSession = (sessionId: string | undefined) => {
  if (!sessionId) return null
  return sessions.get(sessionId) || null
}