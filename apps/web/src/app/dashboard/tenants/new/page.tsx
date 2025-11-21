import { TenantForm } from '@/components/tenant-form';

export default function NewTenantPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Add New Tenant</h1>
      <TenantForm />
    </div>
  );
}
