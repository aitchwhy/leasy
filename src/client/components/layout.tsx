import { ReactNode } from 'react'
import { useSession, signOut } from '@/client/lib/auth'
import { Button } from './ui/button'
import { 
  Building2, 
  FileText, 
  Users, 
  LogOut,
  Menu
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/client/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/client/components/ui/avatar'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Building2 className="h-6 w-6" />
            <span className="text-lg font-semibold">Leasy</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <a href="/dashboard" className="text-sm font-medium hover:text-primary">
              Dashboard
            </a>
            <a href="/invoices" className="text-sm font-medium hover:text-primary">
              Invoices
            </a>
            <a href="/tenants" className="text-sm font-medium hover:text-primary">
              Tenants
            </a>
            <a href="/buildings" className="text-sm font-medium hover:text-primary">
              Buildings
            </a>
          </nav>

          <div className="flex items-center space-x-4">
            {session?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session.user.picture} alt={session.user.name} />
                      <AvatarFallback>
                        {session.user.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{session.user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session.user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="default" onClick={() => window.location.href = '/login'}>
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}