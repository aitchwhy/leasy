'use client';

import { useForm, UseFormRegister, FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useAuth } from '@clerk/nextjs';
// import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const readingSchema = z.object({
  meterId: z.coerce.number(),
  readingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  value: z.coerce.number().min(0),
});

const bulkReadingSchema = z.object({
  readings: z.array(readingSchema),
});

type BulkReadingFormValues = z.infer<typeof bulkReadingSchema>;

type Meter = {
  id: number;
  type: string;
};

type UnitWithMeters = {
  id: number;
  unitNumber: string;
  buildingName: string;
  meters: Meter[];
};

type FlatMeter = Meter & {
  unitName: string;
};

export function UtilityInput() {
  const { getToken } = useAuth();
  // const router = useRouter();
  // const queryClient = useQueryClient();

  const { data: units, isLoading } = useQuery<UnitWithMeters[]>({
    queryKey: ['units-with-meters'],
    queryFn: async () => {
      const token = await getToken();
      return apiClient.get<UnitWithMeters[]>('/api/units', { token });
    },
  });

  const { register, handleSubmit, formState: { errors } } = useForm<BulkReadingFormValues>({
    resolver: zodResolver(bulkReadingSchema),
    defaultValues: {
      readings: [],
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: BulkReadingFormValues) => {
      const token = await getToken();
      return apiClient.post('/utilities/readings', data.readings, { token });
    },
    onSuccess: () => {
      toast.success('Readings submitted successfully');
      // Maybe reset form or redirect?
    },
    onError: (error) => {
      toast.error('Failed to submit readings');
      console.error(error);
    }
  });

  const onSubmit = (data: BulkReadingFormValues) => {
    mutation.mutate(data);
  };

  if (isLoading) return <div>Loading units...</div>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 shadow rounded-lg">
      <div className="space-y-4">
        {units?.map((unit) => (
          <div key={unit.id} className="border-b pb-4">
            <h3 className="text-lg font-medium text-gray-900">{unit.buildingName} - {unit.unitNumber}</h3>
            <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
              {unit.meters.map((meter) => {
                 return (
                    <div key={meter.id} className="flex items-center space-x-4">
                        <span className="w-20 text-sm font-medium text-gray-700">{meter.type}</span>
                        <input
                            type="hidden"
                            {...register(`readings.${meter.id}.meterId` as const, { value: meter.id })}
                        />
                    </div>
                 )
              })}
            </div>
          </div>
        ))}
      </div>
      <MeterList units={units || []} register={register} errors={errors} />

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {mutation.isPending ? 'Saving...' : 'Save Readings'}
        </button>
      </div>
    </form>
  );
}

function MeterList({ units, register }: { units: UnitWithMeters[], register: UseFormRegister<BulkReadingFormValues>, errors: FieldErrors<BulkReadingFormValues> }) {
    // Flatten meters
    const meters: FlatMeter[] = units.flatMap(u => u.meters.map((m) => ({ ...m, unitName: `${u.buildingName} ${u.unitNumber}` })));
    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="space-y-4">
            {meters.map((meter, index) => (
                <div key={meter.id} className="flex items-center space-x-4 border-b pb-2">
                    <div className="w-1/3">
                        <p className="text-sm font-medium text-gray-900">{meter.unitName}</p>
                        <p className="text-xs text-gray-500">{meter.type}</p>
                    </div>
                    <input
                        type="hidden"
                        value={meter.id}
                        {...register(`readings.${index}.meterId`)}
                    />
                    <div className="w-1/3">
                        <label className="block text-xs text-gray-500">Date</label>
                        <input
                            type="date"
                            defaultValue={today}
                            {...register(`readings.${index}.readingDate`)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-1 border"
                        />
                    </div>
                    <div className="w-1/3">
                        <label className="block text-xs text-gray-500">Reading</label>
                        <input
                            type="number"
                            placeholder="Value"
                            {...register(`readings.${index}.value`)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-1 border"
                        />
                    </div>
                </div>
            ))}
             {meters.length === 0 && <p>No meters found.</p>}
        </div>
    )
}
