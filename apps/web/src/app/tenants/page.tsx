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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTenantSchema } from '@leasy/validators';
import { z } from 'zod';
import { toast } from 'sonner';

type Tenant = {
  id: number;
  name: string;
  businessRegistrationId: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  createdAt: string;
};

type CreateTenantForm = z.infer<typeof createTenantSchema>;

export default function TenantsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: tenants, isLoading } = useQuery<Tenant[]>({
    queryKey: ['tenants'],
    queryFn: () => apiClient.get('/tenants'),
  });

  const createTenantMutation = useMutation({
    mutationFn: (data: CreateTenantForm) => apiClient.post('/tenants', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      setIsDialogOpen(false);
      toast.success('Tenant created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create tenant');
    },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateTenantForm>({
    resolver: zodResolver(createTenantSchema),
  });

  const onSubmit = (data: CreateTenantForm) => {
    createTenantMutation.mutate(data);
    reset();
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Tenants</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add Tenant</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Tenant</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name (Company Name)</Label>
                <Input id="name" {...register('name')} />
                {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessRegistrationId">Business Registration ID</Label>
                <Input id="businessRegistrationId" {...register('businessRegistrationId')} />
                {errors.businessRegistrationId && <p className="text-sm text-red-500">{errors.businessRegistrationId.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email</Label>
                <Input id="contactEmail" type="email" {...register('contactEmail')} />
                {errors.contactEmail && <p className="text-sm text-red-500">{errors.contactEmail.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Phone</Label>
                <Input id="contactPhone" {...register('contactPhone')} />
                {errors.contactPhone && <p className="text-sm text-red-500">{errors.contactPhone.message}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={createTenantMutation.isPending}>
                {createTenantMutation.isPending ? 'Creating...' : 'Create Tenant'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Business ID</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tenants?.map((tenant) => (
              <TableRow key={tenant.id}>
                <TableCell className="font-medium">{tenant.name}</TableCell>
                <TableCell>{tenant.businessRegistrationId || '-'}</TableCell>
                <TableCell>
                  <div className="flex flex-col text-sm">
                    <span>{tenant.contactEmail}</span>
                    <span>{tenant.contactPhone}</span>
                  </div>
                </TableCell>
                <TableCell>{new Date(tenant.createdAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
            {tenants?.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-gray-500">
                  No tenants found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
