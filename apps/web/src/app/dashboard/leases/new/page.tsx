import { LeaseForm } from '@/components/lease-form';

export default function NewLeasePage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Add New Lease</h1>
      <LeaseForm />
    </div>
  );
}
