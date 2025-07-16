import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/client/components/ui/sonner'
import { LoginPage } from './pages/login'
import { DashboardPage } from './pages/dashboard'
import { InvoiceFormPage } from './pages/invoice-form'
import { useSession } from './lib/auth'

const queryClient = new QueryClient()

function AppRouter() {
  const { data: session, isPending } = useSession()
  const pathname = window.location.pathname

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  // Public routes
  if (pathname === '/login') {
    if (session?.user) {
      window.location.href = '/dashboard'
      return null
    }
    return <LoginPage />
  }

  // Protected routes
  if (!session?.user) {
    window.location.href = '/login'
    return null
  }

  switch (pathname) {
    case '/':
    case '/dashboard':
      return <DashboardPage />
    case '/invoices/new':
      return <InvoiceFormPage />
    default:
      return <DashboardPage />
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
