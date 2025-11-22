'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { format } from 'date-fns';

type UtilityMeter = {
  id: number;
  unitId: number;
  type: 'ELECTRICITY' | 'WATER';
};

type Unit = {
  id: number;
  unitNumber: string;
  meters: UtilityMeter[];
};

type ReadingInput = {
  meterId: number;
  value: string;
};

export default function UtilityInputPage() {
  const queryClient = useQueryClient();
  const [readings, setReadings] = useState<Record<number, string>>({});
  const [readingDate, setReadingDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const { data: units, isLoading } = useQuery<Unit[]>({
    queryKey: ['units'],
    queryFn: () => apiClient.get('/units'),
  });

  const submitReadingsMutation = useMutation({
    mutationFn: (data: any[]) => apiClient.post('/utilities/readings', data),
    onSuccess: () => {
      toast.success('Readings submitted successfully');
      setReadings({});
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to submit readings');
    },
  });

  const handleReadingChange = (meterId: number, value: string) => {
    setReadings((prev) => ({ ...prev, [meterId]: value }));
  };

  const handleSubmit = () => {
    const payload = Object.entries(readings).map(([meterId, value]) => ({
      meterId: Number(meterId),
      readingDate,
      value: Number(value),
    }));

    if (payload.length === 0) {
      toast.error('Please enter at least one reading');
      return;
    }

    submitReadingsMutation.mutate(payload);
  };

  if (isLoading) return <div>Loading...</div>;

  // Flatten units and meters for display
  const rows = units?.flatMap((unit) =>
    unit.meters.map((meter) => ({
      unitId: unit.id,
      unitNumber: unit.unitNumber,
      meter,
    }))
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Utility Input</h1>
        <div className="flex items-center gap-4">
          <Input
            type="date"
            value={readingDate}
            onChange={(e) => setReadingDate(e.target.value)}
            className="w-40"
          />
          <Button onClick={handleSubmit} disabled={submitReadingsMutation.isPending}>
            {submitReadingsMutation.isPending ? 'Submitting...' : 'Submit Readings'}
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Unit</TableHead>
              <TableHead>Meter Type</TableHead>
              <TableHead>Previous Reading</TableHead>
              <TableHead>Current Reading</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(({ unitNumber, meter }) => (
              <TableRow key={meter.id}>
                <TableCell className="font-medium">{unitNumber}</TableCell>
                <TableCell>{meter.type}</TableCell>
                <TableCell>-</TableCell> {/* TODO: Fetch previous reading */}
                <TableCell>
                  <Input
                    type="number"
                    placeholder="Enter reading"
                    value={readings[meter.id] || ''}
                    onChange={(e) => handleReadingChange(meter.id, e.target.value)}
                    className="w-32"
                  />
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-gray-500">
                  No meters found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
