import { ReactNode } from 'react'
import { Building2 } from 'lucide-react'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <a href="/dashboard" className="flex items-center space-x-2">
              <Building2 className="h-6 w-6" />
              <span className="text-lg font-semibold">Leasy</span>
            </a>
          </div>
          
          <nav className="flex items-center space-x-4">
            <a href="/dashboard" className="text-sm font-medium">Dashboard</a>
            <a href="/invoices/new" className="text-sm font-medium">New Invoice</a>
          </nav>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}