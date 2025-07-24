import { Button } from '@/client/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/client/components/ui/card'
import { Input } from '@/client/components/ui/input'
import { Label } from '@/client/components/ui/label'
import { MockLoginRequestSchema } from '@/shared/types'
import { useState } from 'react'
import { toast } from 'sonner'

export function LoginPage() {
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate input
    const parsed = MockLoginRequestSchema.safeParse({ name })
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message)
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/mock-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      })

            if (!response.ok) {
        const error = await response.json() as { error?: string }
        throw new Error(error.error || 'Login failed')
      }

      const data = await response.json() as { token: string; user: { name: string; role: string } }

      // Store token in localStorage
      localStorage.setItem('auth_token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      toast.success('Login successful!')
      window.location.href = '/dashboard'
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome to Leasy</CardTitle>
          <CardDescription>
            Invoice Management System for Property Managers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                autoFocus
              />
              <p className="text-sm text-muted-foreground">
                For demo, use "Il Keun Lee"
              </p>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !name.trim()}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
