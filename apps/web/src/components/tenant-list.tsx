'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import { Plus } from 'lucide-react';

type Tenant = {
  id: number;
  name: string;
  businessRegistrationId: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
};

export function TenantList() {
  const { getToken } = useAuth();

  const { data: tenants, isLoading, error } = useQuery({
    queryKey: ['tenants'],
    queryFn: async () => {
      const token = await getToken();
      return apiClient.get<Tenant[]>('/api/tenants', { token });
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading tenants</div>;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Tenants</h2>
        <Link
          href="/dashboard/tenants/new"
          className="flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Tenant
        </Link>
      </div>
      <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Business ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Contact</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {tenants?.map((tenant) => (
              <tr key={tenant.id}>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{tenant.name}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{tenant.businessRegistrationId || '-'}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {tenant.contactEmail} <br /> {tenant.contactPhone}
                </td>
              </tr>
            ))}
            {tenants?.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                  No tenants found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
