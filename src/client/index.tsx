import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app'

// Initialize MSW in development
async function enableMocking() {
  if (process.env.NODE_ENV !== 'development') {
    return
  }

  const { worker } = await import('./mocks/browser')

  // Start the worker with onUnhandledRequest set to bypass for unhandled requests
  return worker.start({
    onUnhandledRequest: 'bypass',
  })
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
})
