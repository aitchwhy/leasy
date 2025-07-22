import { Layout } from '@/client/components/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/client/components/ui/card'
import { Button } from '@/client/components/ui/button'
import { Input } from '@/client/components/ui/input'
import { Label } from '@/client/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/client/components/ui/select'

export function InvoiceFormPage() {
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
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="building">Building</Label>
                  <Select>
                    <SelectTrigger id="building">
                      <SelectValue placeholder="Select a building" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="main-plaza">Main Plaza</SelectItem>
                      <SelectItem value="tech-center">Tech Center</SelectItem>
                      <SelectItem value="west-tower">West Tower</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tenant">Tenant</Label>
                  <Select>
                    <SelectTrigger id="tenant">
                      <SelectValue placeholder="Select a tenant" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="abc-corp">ABC Corp</SelectItem>
                      <SelectItem value="xyz-llc">XYZ LLC</SelectItem>
                      <SelectItem value="tech-startup">Tech Startup Inc</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invoice-date">Invoice Date</Label>
                  <Input id="invoice-date" type="date" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="due-date">Due Date</Label>
                  <Input id="due-date" type="date" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input id="amount" type="number" placeholder="0.00" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" placeholder="Monthly rent" />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button variant="outline" asChild>
                  <a href="/dashboard">Cancel</a>
                </Button>
                <Button type="submit">Generate Invoice</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}