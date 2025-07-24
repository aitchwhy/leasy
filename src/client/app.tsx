import { Toaster } from '@/client/components/ui/sonner'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { InvoiceGeneratePage } from './pages/invoice-generate'
import { LoginPage } from './pages/login'
import { MVPDashboardPage } from './pages/mvp-dashboard'

const queryClient = new QueryClient()

function AppRouter() {
  const pathname = window.location.pathname

  // Check if user is authenticated
  const isAuthenticated = !!localStorage.getItem('auth_token')

  // Redirect to login if not authenticated (except for login page)
  if (!isAuthenticated && pathname !== '/login') {
    window.location.href = '/login'
    return null
  }

  // Redirect to dashboard if authenticated and on login page
  if (isAuthenticated && pathname === '/login') {
    window.location.href = '/dashboard'
    return null
  }

  switch (pathname) {
    case '/login':
      return <LoginPage />
    case '/':
    case '/dashboard':
      return <MVPDashboardPage />
    case '/invoices/new':
    case '/invoices/generate':
      return <InvoiceGeneratePage />
    default:
      return <MVPDashboardPage />
  }
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
      <Toaster />
    </QueryClientProvider>
  )
}

export default App
