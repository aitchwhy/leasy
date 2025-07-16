import { Hono } from 'hono'
import { renderer } from './renderer'
import api from './api'
import { authHandler } from './auth'

const app = new Hono()

app.route('/api/auth', authHandler)
app.route('/api', api)

app.use(renderer)

app.get('/', (c) => {
  return c.redirect('/dashboard')
})

app.get('/login', (c) => {
  return c.render(
    <>
      <title>Leasy - Login</title>
      <div id="root"></div>
    </>
  )
})

app.get('/dashboard', (c) => {
  return c.render(
    <>
      <title>Leasy - Dashboard</title>
      <div id="root"></div>
    </>
  )
})

app.get('/invoices/new', (c) => {
  return c.render(
    <>
      <title>Leasy - Generate Invoice</title>
      <div id="root"></div>
    </>
  )
})

export default app
