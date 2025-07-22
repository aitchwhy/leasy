import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/client/components/ui/sonner'
import { DashboardPage } from './pages/dashboard'
import { InvoiceFormPage } from './pages/invoice-form'

const queryClient = new QueryClient()

function AppRouter() {
  const pathname = window.location.pathname

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