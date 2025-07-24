import { useState } from 'react'
import { Layout } from '@/client/components/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/client/components/ui/card'
import { Button } from '@/client/components/ui/button'
import { Input } from '@/client/components/ui/input'
import { Label } from '@/client/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/client/components/ui/select'
import { useBuildings, useLeases, useCreateInvoice } from '@/client/hooks/useApi'

export function InvoiceFormPage() {
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('')
  const [selectedLeaseId, setSelectedLeaseId] = useState<string>('')
  const [issueDate, setIssueDate] = useState<string>('')
  const [dueDate, setDueDate] = useState<string>('')
  
  const { data: buildings, isLoading: buildingsLoading } = useBuildings()
  const { data: leases, isLoading: leasesLoading } = useLeases(selectedBuildingId)
  const createInvoice = useCreateInvoice()
  
  const selectedLease = leases?.find(l => l.lease_id === selectedLeaseId)
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedLeaseId) {
      return
    }
    
    createInvoice.mutate({
      lease_id: selectedLeaseId,
      issue_date: issueDate || undefined,
      due_date: dueDate || undefined,
    }, {
      onSuccess: () => {
        // Reset form
        setSelectedBuildingId('')
        setSelectedLeaseId('')
        setIssueDate('')
        setDueDate('')
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 2000)
      }
    })
  }
  
  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Generate Invoice</h1>
          <p className="text-muted-foreground">Create a new invoice for your tenants</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
            <CardDescription>Fill in the invoice information below</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="building">Building</Label>
                  <Select 
                    value={selectedBuildingId} 
                    onValueChange={(value) => {
                      setSelectedBuildingId(value)
                      setSelectedLeaseId('') // Reset lease selection
                    }}
                    disabled={buildingsLoading}
                  >
                    <SelectTrigger id="building">
                      <SelectValue placeholder={buildingsLoading ? "Loading..." : "Select a building"} />
                    </SelectTrigger>
                    <SelectContent>
                      {buildings?.map((building) => (
                        <SelectItem key={building.building_id} value={building.building_id}>
                          {building.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tenant">Tenant</Label>
                  <Select 
                    value={selectedLeaseId} 
                    onValueChange={setSelectedLeaseId}
                    disabled={!selectedBuildingId || leasesLoading}
                  >
                    <SelectTrigger id="tenant">
                      <SelectValue placeholder={
                        !selectedBuildingId 
                          ? "Select a building first" 
                          : leasesLoading 
                          ? "Loading..." 
                          : "Select a tenant"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {leases?.map((lease) => (
                        <SelectItem key={lease.lease_id} value={lease.lease_id}>
                          {lease.tenant_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invoice-date">Invoice Date</Label>
                  <Input 
                    id="invoice-date" 
                    type="date" 
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="due-date">Due Date</Label>
                  <Input 
                    id="due-date" 
                    type="date" 
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input 
                    id="amount" 
                    type="number" 
                    placeholder="0.00" 
                    value={selectedLease?.rent_amount || ''}
                    readOnly
                    disabled
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input 
                    id="description" 
                    placeholder="Monthly rent" 
                    value={selectedLease ? `Monthly Rent - ${selectedLease.tenant_name}` : ''}
                    readOnly
                    disabled
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button variant="outline" asChild>
                  <a href="/dashboard">Cancel</a>
                </Button>
                <Button 
                  type="submit" 
                  disabled={!selectedLeaseId || createInvoice.isPending}
                >
                  {createInvoice.isPending ? 'Creating...' : 'Generate Invoice'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}