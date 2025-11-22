'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { Plus } from 'lucide-react';

type Invoice = {
  id: number;
  leaseId: number;
  billingPeriod: string;
  issueDate: string;
  dueDate: string;
  totalAmountKrw: string;
  status: 'DRAFT' | 'ISSUED' | 'PAID' | 'OVERDUE' | 'VOID';
};

export function InvoiceList() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const token = await getToken();
      return apiClient.get<Invoice[]>('/api/invoices', { token });
    },
  });

  const statusMutation = useMutation({

    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const token = await getToken();
      return apiClient.put(`/invoices/${id}/status`, { status }, { token });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });

  const handleStatusChange = (id: number, newStatus: string) => {
    if (confirm(`Change status to ${newStatus}?`)) {
        statusMutation.mutate({ id, status: newStatus });
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Invoices</h2>
        <Link
          href="/dashboard/invoices/generate"
          className="flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Generate Invoices
        </Link>
      </div>
      <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Period</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Lease ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Amount (KRW)</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Due Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {invoices?.map((invoice) => (
              <tr key={invoice.id}>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{invoice.billingPeriod}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  <Link href={`/dashboard/invoices/${invoice.id}`} className="text-indigo-600 hover:text-indigo-900">
                    {invoice.id}
                  </Link>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 font-medium">{Number(invoice.totalAmountKrw).toLocaleString()}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{invoice.dueDate}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5
                    ${invoice.status === 'PAID' ? 'bg-green-100 text-green-800' :
                      invoice.status === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'}`}>
                    {invoice.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    <select
                        value={invoice.status}
                        onChange={(e) => handleStatusChange(invoice.id, e.target.value)}
                        className="rounded border-gray-300 text-xs"
                    >
                        <option value="DRAFT">DRAFT</option>
                        <option value="ISSUED">ISSUED</option>
                        <option value="PAID">PAID</option>
                        <option value="OVERDUE">OVERDUE</option>
                        <option value="VOID">VOID</option>
                    </select>
                </td>
              </tr>
            ))}
            {invoices?.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                  No invoices found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
