'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { Plus } from 'lucide-react';

type Lease = {
  id: number;
  unitId: number;
  tenantId: number;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  baseRentKrw: string;
};

export function LeaseList() {
  const { getToken } = useAuth();

  const { data: leases, isLoading } = useQuery({
    queryKey: ['leases'],
    queryFn: async () => {
      const token = await getToken();
      return apiClient.get<Lease[]>('/api/leases', { token });
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Leases</h2>
        <Link
          href="/dashboard/leases/new"
          className="flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Lease
        </Link>
      </div>
      <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Unit</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Tenant</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Period</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Rent (KRW)</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {leases?.map((lease) => (
              <tr key={lease.id}>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{lease.unitId}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{lease.tenantId}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {lease.startDate} ~ {lease.endDate || 'Indefinite'}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{Number(lease.baseRentKrw).toLocaleString()}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${lease.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {lease.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
            {leases?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                  No leases found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
