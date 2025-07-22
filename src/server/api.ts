import { Hono } from 'hono'

const app = new Hono()

// Simple health check endpoint
app.get('/health', (c) => {
  return c.json({ status: 'ok' })
})

export default app
export type AppType = typeof app