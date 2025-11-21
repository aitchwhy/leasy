import { createMiddleware } from 'hono/factory';
import { verifyToken } from '@clerk/backend';
import { Context, Next } from 'hono';

// We might use @hono/clerk-auth if it works well, or manual verification if we need more control
// The prompt asked to "Integrate Clerk for authentication within the Hono environment".
// @hono/clerk-auth is the standard way.

import { clerkMiddleware, getAuth } from '@hono/clerk-auth';

export const authMiddleware = clerkMiddleware();

export const requireAuth = createMiddleware(async (c: Context, next: Next) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  await next();
});
