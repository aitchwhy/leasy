import { Layout } from '@/client/components/layout'
import { Button } from '@/client/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/client/components/ui/card'
import { Checkbox } from '@/client/components/ui/checkbox'
import { Label } from '@/client/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/client/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/client/components/ui/table'
import type { GenerateInvoicesResponse, TenantBilling } from '@/shared/types'
import { Download, FileText } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export function InvoiceGeneratePage() {
  const [tenants, setTenants] = useState<TenantBilling[]>([])
  const [selectedTenants, setSelectedTenants] = useState<Set<string>>(new Set())
  const [period, setPeriod] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedInvoices, setGeneratedInvoices] = useState<GenerateInvoicesResponse | null>(null)

  useEffect(() => {
    // Set default period to current month
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1
    setPeriod(`${year}년 ${month}월`)

    fetchTenants()
  }, [])

  const fetchTenants = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        window.location.href = '/login'
        return
      }

      const response = await fetch('/api/tenants', {
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
        throw new Error('Failed to fetch tenants')
      }

      const data = await response.json() as TenantBilling[]
      setTenants(data)
      // Select all tenants by default
      setSelectedTenants(new Set(data.map(t => t.id)))
    } catch (error) {
      toast.error('Failed to load tenant data')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTenants(new Set(tenants.map(t => t.id)))
    } else {
      setSelectedTenants(new Set())
    }
  }

  const handleSelectTenant = (tenantId: string, checked: boolean) => {
    const newSelected = new Set(selectedTenants)
    if (checked) {
      newSelected.add(tenantId)
    } else {
      newSelected.delete(tenantId)
    }
    setSelectedTenants(newSelected)
  }

  const handleGenerate = async () => {
    if (selectedTenants.size === 0) {
      toast.error('Please select at least one tenant')
      return
    }

    setIsGenerating(true)
    setGeneratedInvoices(null)

    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('/api/invoices/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          period,
          tenantIds: Array.from(selectedTenants)
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate invoices')
      }

      const data = await response.json() as GenerateInvoicesResponse
      setGeneratedInvoices(data)
      toast.success(`Successfully generated ${data.count} invoices`)
    } catch (error) {
      toast.error('Failed to generate invoices')
      console.error(error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadPdf = async (invoiceId: string) => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`/api/invoices/${invoiceId}/pdf`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to download PDF')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice-${invoiceId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      toast.error('Failed to download PDF')
      console.error(error)
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

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Generate Monthly Invoices</h1>
          <p className="text-muted-foreground">
            Select tenants and generate invoices for the specified period
          </p>
        </div>

        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Configuration</CardTitle>
            <CardDescription>Configure invoice generation settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="period">Period</Label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger id="period">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025년 5월">2025년 5월</SelectItem>
                  <SelectItem value="2025년 6월">2025년 6월</SelectItem>
                  <SelectItem value="2025년 7월">2025년 7월</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tenant Selection */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Select Tenants</CardTitle>
                <CardDescription>Choose which tenants to generate invoices for</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                                  <Checkbox
                    id="select-all"
                    checked={selectedTenants.size === tenants.length && tenants.length > 0}
                    onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                  />
                <Label htmlFor="select-all">Select All</Label>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Business Number</TableHead>
                  <TableHead className="text-right">Rent</TableHead>
                  <TableHead className="text-right">Electricity</TableHead>
                  <TableHead className="text-right">Water</TableHead>
                  <TableHead className="text-right">VAT</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenants.map((tenant) => (
                  <TableRow key={tenant.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedTenants.has(tenant.id)}
                        onCheckedChange={(checked) =>
                          handleSelectTenant(tenant.id, checked as boolean)
                        }
                      />
                    </TableCell>
                    <TableCell className="font-medium">{tenant.unit}</TableCell>
                    <TableCell>{tenant.name}</TableCell>
                    <TableCell>{tenant.businessNumber}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(tenant.monthlyRent)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(tenant.electricityCharge)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(tenant.waterCharge)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(tenant.vat)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(tenant.totalAmount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Generate Button */}
        <div className="flex justify-end">
          <Button
            size="lg"
            onClick={handleGenerate}
            disabled={selectedTenants.size === 0 || isGenerating}
          >
            <FileText className="mr-2 h-4 w-4" />
            {isGenerating ? 'Generating...' : `Generate ${selectedTenants.size} Invoice${selectedTenants.size !== 1 ? 's' : ''}`}
          </Button>
        </div>

        {/* Generated Invoices */}
        {generatedInvoices && (
          <Card>
            <CardHeader>
              <CardTitle>Generated Invoices</CardTitle>
              <CardDescription>
                Successfully generated {generatedInvoices.count} invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>Tenant</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {generatedInvoices.invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-mono text-sm">{invoice.id}</TableCell>
                      <TableCell>{invoice.tenantName}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(invoice.amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadPdf(invoice.id)}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download PDF
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  )
}
