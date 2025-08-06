import { Hono } from 'hono'

const app = new Hono()

// Health check
app.get('/', (c) => {
  return c.text('OK')
})
export default app
