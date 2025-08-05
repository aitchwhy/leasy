import { Hono } from 'hono'

const app = new Hono()

// Health check
app.get('/', (c) => {
  return c.text('Hello World Hank')
})
export default app
