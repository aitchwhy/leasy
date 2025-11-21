export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
      <p className="mt-2 text-gray-600">Welcome to Leasy Property Management System.</p>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Placeholder cards */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-medium text-gray-900">Total Tenants</h3>
          <p className="mt-2 text-3xl font-bold text-indigo-600">-</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-medium text-gray-900">Active Leases</h3>
          <p className="mt-2 text-3xl font-bold text-indigo-600">-</p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-medium text-gray-900">Pending Invoices</h3>
          <p className="mt-2 text-3xl font-bold text-indigo-600">-</p>
        </div>
      </div>
    </div>
  );
}
