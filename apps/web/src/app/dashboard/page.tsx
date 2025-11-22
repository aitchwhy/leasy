'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export default function DashboardPage() {
  const { data: tenants } = useQuery<any[]>({
    queryKey: ['tenants'],
    queryFn: () => apiClient.get('/tenants'),
  });

  const { data: leases } = useQuery<any[]>({
    queryKey: ['leases'],
    queryFn: () => apiClient.get('/leases'),
  });

  const { data: invoices } = useQuery<any[]>({
    queryKey: ['invoices'],
    queryFn: () => apiClient.get('/invoices'),
  });

  const activeLeasesCount = leases?.filter((l: any) => l.isActive).length || 0;
  const pendingInvoicesCount = invoices?.filter((i: any) => i.status === 'DRAFT' || i.status === 'ISSUED').length || 0;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
      <p className="mt-2 text-gray-600">Welcome to Leasy Property Management System.</p>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-medium text-gray-900">Total Tenants</h3>
          <p className="mt-2 text-3xl font-bold text-indigo-600">{tenants?.length || 0}</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-medium text-gray-900">Active Leases</h3>
          <p className="mt-2 text-3xl font-bold text-indigo-600">{activeLeasesCount}</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-medium text-gray-900">Pending Invoices</h3>
          <p className="mt-2 text-3xl font-bold text-indigo-600">{pendingInvoicesCount}</p>
        </div>
      </div>
    </div>
  );
}
