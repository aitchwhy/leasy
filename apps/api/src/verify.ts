import app from './index';

async function test() {
  console.log('Testing API...');

  // Mock request to /health
  const res = await app.request('/health');
  console.log('/health:', res.status, await res.json());

  // Mock request to /api/tenants (should fail without auth, but we can test the route existence)
  // Since we use clerkMiddleware, it might return 401 or 500 if keys are missing.
  // But we just want to see if it compiles and runs.
  try {
      const res2 = await app.request('/api/tenants');
      console.log('/api/tenants:', res2.status);
  } catch (e) {
      console.log('/api/tenants error:', e);
  }

  console.log('Done.');
}

test();
