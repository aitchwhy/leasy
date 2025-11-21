'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const createLeaseSchema = z.object({
  unitId: z.coerce.number().positive(),
  tenantId: z.coerce.number().positive(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal('')),
  baseRentKrw: z.string().regex(/^\d+(\.\d+)?$/),
  managementFeeKrw: z.string().regex(/^\d+(\.\d+)?$/),
  depositKrw: z.string().regex(/^\d+(\.\d+)?$/),
  isActive: z.boolean(),
});

type LeaseFormValues = z.infer<typeof createLeaseSchema>;

export function LeaseForm() {
  const { getToken } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors } } = useForm<LeaseFormValues>({
    resolver: zodResolver(createLeaseSchema),
    defaultValues: {
        managementFeeKrw: "0",
        isActive: true,
        endDate: '', // Handle empty string for optional date
    }
  });

  // Fetch Units and Tenants for dropdowns
  const { data: units } = useQuery({
      queryKey: ['units'],
      queryFn: async () => {
          const token = await getToken();
          return apiClient<{ id: number, unitNumber: string, buildingName: string }[]>('/api/units', { token });
      }
  });

  const { data: tenants } = useQuery({
      queryKey: ['tenants'],
      queryFn: async () => {
          const token = await getToken();
          return apiClient<{ id: number, name: string }[]>('/api/tenants', { token });
      }
  });

  const mutation = useMutation({
    mutationFn: async (data: LeaseFormValues) => {
      const token = await getToken();
      // Clean up empty string endDate to undefined if needed, or let Zod handle it (schema allows literal '')
      // But API expects optional.
      const payload = {
          ...data,
          endDate: data.endDate === '' ? undefined : data.endDate,
      };
      return apiClient('/api/leases', {
        method: 'POST',
        body: JSON.stringify(payload),
        token,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leases'] });
      toast.success('Lease created successfully');
      router.push('/dashboard/leases');
    },
    onError: (error) => {
      toast.error('Failed to create lease');
      console.error(error);
    }
  });

  const onSubmit = (data: LeaseFormValues) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 shadow rounded-lg">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
            <label htmlFor="unitId" className="block text-sm font-medium text-gray-700">Unit</label>
            <select
            id="unitId"
            {...register('unitId')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            >
            <option value="">Select Unit</option>
            {units?.map(u => (
                <option key={u.id} value={u.id}>{u.buildingName} - {u.unitNumber}</option>
            ))}
            </select>
            {errors.unitId && <p className="mt-1 text-sm text-red-600">{errors.unitId.message}</p>}
        </div>

        <div>
            <label htmlFor="tenantId" className="block text-sm font-medium text-gray-700">Tenant</label>
            <select
            id="tenantId"
            {...register('tenantId')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            >
            <option value="">Select Tenant</option>
            {tenants?.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
            ))}
            </select>
            {errors.tenantId && <p className="mt-1 text-sm text-red-600">{errors.tenantId.message}</p>}
        </div>

        <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
            type="date"
            id="startDate"
            {...register('startDate')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            />
            {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>}
        </div>

        <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
            <input
            type="date"
            id="endDate"
            {...register('endDate')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            />
        </div>

        <div>
            <label htmlFor="baseRentKrw" className="block text-sm font-medium text-gray-700">Base Rent (KRW)</label>
            <input
            type="number"
            id="baseRentKrw"
            {...register('baseRentKrw')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            />
            {errors.baseRentKrw && <p className="mt-1 text-sm text-red-600">{errors.baseRentKrw.message}</p>}
        </div>

        <div>
            <label htmlFor="managementFeeKrw" className="block text-sm font-medium text-gray-700">Mgmt Fee (KRW)</label>
            <input
            type="number"
            id="managementFeeKrw"
            {...register('managementFeeKrw')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            />
        </div>

        <div>
            <label htmlFor="depositKrw" className="block text-sm font-medium text-gray-700">Deposit (KRW)</label>
            <input
            type="number"
            id="depositKrw"
            {...register('depositKrw')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            />
             {errors.depositKrw && <p className="mt-1 text-sm text-red-600">{errors.depositKrw.message}</p>}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {mutation.isPending ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
}
