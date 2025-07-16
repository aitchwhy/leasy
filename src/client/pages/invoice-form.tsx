import { useState } from 'react'
import { Layout } from '@/client/components/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/client/components/ui/card'
import { Button } from '@/client/components/ui/button'
import { Label } from '@/client/components/ui/label'
import { Input } from '@/client/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/client/components/ui/select'
import { DatePicker } from '@/client/components/ui/date-picker'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export function InvoiceFormPage() {
  const [lineItems, setLineItems] = useState([
    { description: 'Base Rent', amount: 0, category: 'base_rent' }
  ])

  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', amount: 0, category: 'other' }])
  }

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index))
  }

  const updateLineItem = (index: number, field: string, value: any) => {
    const updated = [...lineItems]
    updated[index] = { ...updated[index], [field]: value }
    setLineItems(updated)
  }

  const totalAmount = lineItems.reduce((sum, item) => sum + (item.amount || 0), 0)

  const handlePreview = () => {
    toast.info('Preview functionality coming soon!')
  }

  const handleGenerate = () => {
    toast.success('Invoice generated successfully!')
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Generate Invoice</h1>
          <p className="text-muted-foreground">Create a new invoice for your tenant</p>
        </div>

        <div className="grid gap-6">
          {/* Building and Tenant Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
              <CardDescription>Select the building and tenant for this invoice</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="building">Building</Label>
                <Select>
                  <SelectTrigger id="building">
                    <SelectValue placeholder="Select a building" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">123 Main Street</SelectItem>
                    <SelectItem value="2">456 Oak Avenue</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="tenant">Tenant</Label>
                <Select>
                  <SelectTrigger id="tenant">
                    <SelectValue placeholder="Select a tenant" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">ABC Corp - Unit 201</SelectItem>
                    <SelectItem value="2">XYZ LLC - Unit 305</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Period */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Period</CardTitle>
              <CardDescription>Select the billing period for this invoice</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="period-start">Period Start</Label>
                <DatePicker
                  date={undefined}
                  onDateChange={(date) => console.log('Period start:', date)}
                  placeholder="Select start date"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="period-end">Period End</Label>
                <DatePicker
                  date={undefined}
                  onDateChange={(date) => console.log('Period end:', date)}
                  placeholder="Select end date"
                />
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader>
              <CardTitle>Line Items</CardTitle>
              <CardDescription>Add the charges for this invoice</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {lineItems.map((item, index) => (
                <div key={index} className="grid gap-4 md:grid-cols-3 items-end">
                  <div className="grid gap-2">
                    <Label htmlFor={`description-${index}`}>Description</Label>
                    <Input
                      type="text"
                      id={`description-${index}`}
                      value={item.description}
                      onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor={`amount-${index}`}>Amount</Label>
                    <Input
                      type="number"
                      id={`amount-${index}`}
                      value={item.amount}
                      onChange={(e) => updateLineItem(index, 'amount', parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLineItem(index)}
                    disabled={lineItems.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button variant="outline" onClick={addLineItem} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Line Item
              </Button>

              <div className="pt-4 border-t flex justify-between items-center">
                <span className="text-lg font-semibold">Total Amount:</span>
                <span className="text-2xl font-bold">${totalAmount.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4 justify-end">
            <Button variant="outline" onClick={handlePreview}>
              Preview
            </Button>
            <Button onClick={handleGenerate}>
              Generate Invoice
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  )
}