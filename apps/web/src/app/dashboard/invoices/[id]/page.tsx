'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useAuth } from '@clerk/nextjs';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { InvoicePDF } from '@/components/invoice-pdf';

import { InvoiceDetail } from '@/types/invoice';

const PDFViewer = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFViewer),
  {
    ssr: false,
    loading: () => <p>Loading PDF Viewer...</p>,
  }
);

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const { getToken } = useAuth();

  const { data: invoice, isLoading, error } = useQuery<InvoiceDetail>({
    queryKey: ['invoice', id],
    queryFn: async () => {
      const token = await getToken();
      return apiClient<InvoiceDetail>(`/api/invoices/${id}`, { token });
    },
    enabled: !!id,
  });

  if (isLoading) return <div>Loading invoice...</div>;
  if (error) return <div>Error loading invoice</div>;
  if (!invoice) return <div>Invoice not found</div>;

  return (
    <div className="h-screen flex flex-col">
      <h1 className="text-2xl font-bold mb-4">Invoice #{invoice.id}</h1>
      <div className="flex-grow">
        <PDFViewer width="100%" height="100%" className="rounded-lg shadow-lg">
          <InvoicePDF
            invoice={invoice}
            tenant={invoice.tenant}
            unit={invoice.unit}
            lineItems={invoice.lineItems}
          />
        </PDFViewer>
      </div>
    </div>
  );
}
