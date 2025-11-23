'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useAuth } from '@clerk/nextjs';
import { useParams } from 'next/navigation';
import { PDFDownloadLink } from '@react-pdf/renderer';



import { InvoicePDF } from './InvoicePDF';

interface InvoiceLineItem {
  description: string;
  amountKrw: string;
  vatKrw: string;
}

interface Invoice {
  id: number;
  billingPeriod: string;
  issueDate: string;
  dueDate: string;
  totalAmountKrw: string;
  status: string;
  tenant?: {
    name: string;
    businessRegistrationId?: string;
  };
  unit?: { buildingName: string; unitNumber: string };
  lineItems?: InvoiceLineItem[];
}


export function InvoiceDetail() {
  const { id } = useParams();
  const { getToken } = useAuth();

  const { data: invoice, isLoading, error } = useQuery<Invoice>({
    queryKey: ['invoice', id],
    queryFn: async () => {
      const token = await getToken();
      return apiClient.get<Invoice>(`/api/invoices/${id}`, { token });
    },
    enabled: !!id,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading invoice</div>;
  if (!invoice) return <div>Invoice not found</div>;

  return (
    <div className="bg-white p-6 shadow rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Invoice #{invoice.id}</h1>
        <PDFDownloadLink
          document={<InvoicePDF invoice={invoice} />}
          fileName={`invoice-${invoice.id}.pdf`}
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {({ loading }) => (loading ? 'Loading document...' : 'Download PDF')}
        </PDFDownloadLink>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-sm text-gray-500">Billing Period</p>
          <p className="text-lg font-medium">{invoice.billingPeriod}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Status</p>
          <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5
            ${invoice.status === 'PAID' ? 'bg-green-100 text-green-800' :
              invoice.status === 'OVERDUE' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'}`}>
            {invoice.status}
          </span>
        </div>
        <div>
          <p className="text-sm text-gray-500">Issue Date</p>
          <p className="text-lg font-medium">{invoice.issueDate}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Due Date</p>
          <p className="text-lg font-medium">{invoice.dueDate}</p>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Line Items</h3>
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Description</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Amount</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">VAT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {invoice.lineItems?.map((item, index) => (
              <tr key={index}>
                <td className="px-6 py-4 text-sm text-gray-900">{item.description}</td>
                <td className="px-6 py-4 text-sm text-gray-900 text-right">{Number(item.amountKrw).toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-gray-500 text-right">{Number(item.vatKrw).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td className="px-6 py-4 text-sm font-bold text-gray-900">Total</td>
              <td colSpan={2} className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                {Number(invoice.totalAmountKrw).toLocaleString()} KRW
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
