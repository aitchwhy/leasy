'use client';

import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type LineItem = {
  id: number;
  type: string;
  description: string;
  amountKrw: string;
  vatKrw: string;
};

type InvoiceDetail = {
  id: number;
  billingPeriod: string;
  issueDate: string;
  dueDate: string;
  totalAmountKrw: string;
  status: string;
  lineItems: LineItem[];
  tenant: {
    name: string;
    businessRegistrationId: string;
  };
  unit: {
    unitNumber: string;
  };
};

export default function InvoiceDetailPage() {
  const params = useParams();
  const id = params.id;

  const { data: invoice, isLoading, error } = useQuery<InvoiceDetail>({
    queryKey: ['invoice', id],
    queryFn: () => apiClient.get(`/invoices/${id}`),
    enabled: !!id,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading invoice</div>;
  if (!invoice) return <div>Invoice not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Invoice #{invoice.id}</h1>
        <Button variant="outline" onClick={() => alert('PDF Export not implemented yet')}>
          Export PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Billing Period</span>
              <span className="font-medium">{invoice.billingPeriod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Issue Date</span>
              <span className="font-medium">{invoice.issueDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Due Date</span>
              <span className="font-medium">{invoice.dueDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Status</span>
              <span className="font-medium">{invoice.status}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tenant Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Tenant Name</span>
              <span className="font-medium">{invoice.tenant.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Unit</span>
              <span className="font-medium">{invoice.unit.unitNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Business ID</span>
              <span className="font-medium">{invoice.tenant.businessRegistrationId || '-'}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">VAT</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.lineItems.map((item) => {
                const amount = Number(item.amountKrw);
                const vat = Number(item.vatKrw);
                const total = amount + vat;
                return (
                  <TableRow key={item.id}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell className="text-right">{amount.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{vat.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{total.toLocaleString()}</TableCell>
                  </TableRow>
                );
              })}
              <TableRow className="font-bold">
                <TableCell colSpan={4} className="text-right">Total Amount</TableCell>
                <TableCell className="text-right">{Number(invoice.totalAmountKrw).toLocaleString()} KRW</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
