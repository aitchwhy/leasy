import { Layout } from '@/client/components/layout'
import { Button } from '@/client/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/client/components/ui/card'
import type { DashboardResponse } from '@/shared/types'
import { Building2, DollarSign, FileText, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export function MVPDashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        window.location.href = '/login'
        return
      }

      const response = await fetch('/api/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('auth_token')
          localStorage.removeItem('user')
          window.location.href = '/login'
          return
        }
        throw new Error('Failed to fetch dashboard data')
      }

      const data = await response.json() as DashboardResponse
      setDashboardData(data)
    } catch (error) {
      toast.error('Failed to load dashboard data')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(amount)
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p>Loading...</p>
        </div>
      </Layout>
    )
  }

  if (!dashboardData) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p>No data available</p>
        </div>
      </Layout>
    )
  }

  const { building, summary } = dashboardData

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">{building.name} Dashboard</h1>
          <p className="text-muted-foreground">
            Owner: {building.owner} | {building.address}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Units</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{building.totalUnits}</div>
              <p className="text-xs text-muted-foreground">
                {building.occupiedUnits} occupied
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalTenants}</div>
              <p className="text-xs text-muted-foreground">Active tenants</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(summary.totalMonthlyRevenue)}
              </div>
              <p className="text-xs text-muted-foreground">Including VAT</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Actions</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                            <Button
                className="w-full"
                onClick={() => window.location.href = '/invoices/generate'}
              >
                Generate Invoices
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your property and generate invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
                            <Button
                size="lg"
                onClick={() => window.location.href = '/invoices/generate'}
              >
                <FileText className="mr-2 h-4 w-4" />
                Generate Monthly Invoices
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
