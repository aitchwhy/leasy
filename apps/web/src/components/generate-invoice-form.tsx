'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const generateInvoiceSchema = z.object({
  year: z.coerce.number().min(2000).max(2100),
  month: z.coerce.number().min(1).max(12),
});

type GenerateInvoiceFormValues = z.infer<typeof generateInvoiceSchema>;

export function GenerateInvoiceForm() {
  const { getToken } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors } } = useForm<GenerateInvoiceFormValues>({
    resolver: zodResolver(generateInvoiceSchema),
    defaultValues: {
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
    }
  });

// ...

  const mutation = useMutation({

    mutationFn: async (data: GenerateInvoiceFormValues) => {
      const token = await getToken();
      return apiClient.post('/invoices/generate', data, { token });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoices generated successfully');
      router.push('/dashboard/invoices');
    },
    onError: (error) => {
      toast.error('Failed to generate invoices');
      console.error(error);
    }
  });

  const onSubmit = (data: GenerateInvoiceFormValues) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 shadow rounded-lg max-w-md">
      <div>
        <label htmlFor="year" className="block text-sm font-medium text-gray-700">Year</label>
        <input
          type="number"
          id="year"
          {...register('year')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
        />
        {errors.year && <p className="mt-1 text-sm text-red-600">{errors.year.message}</p>}
      </div>

      <div>
        <label htmlFor="month" className="block text-sm font-medium text-gray-700">Month</label>
        <input
          type="number"
          id="month"
          {...register('month')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
        />
        {errors.month && <p className="mt-1 text-sm text-red-600">{errors.month.message}</p>}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {mutation.isPending ? 'Generating...' : 'Generate Invoices'}
        </button>
      </div>
    </form>
  );
}
