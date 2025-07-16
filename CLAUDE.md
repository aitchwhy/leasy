# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Leasy is a modern invoice generator web app for commercial building owners managing multiple tenants. Built with Hono + Vite + React, it features authentication, invoice generation, PDF export, and tenant management.

## Development Commands
```bash
npm run dev        # Start Vite development server
npm run build      # Build client and server bundles
npm run preview    # Run built app with Wrangler
npm run deploy     # Deploy to Cloudflare Workers
npm run test       # Run unit tests with Vitest
npm run test:e2e   # Run E2E tests with Playwright
```

## Architecture
- **Server** (src/server/): Hono framework on Cloudflare Workers
  - `auth.ts`: Better Auth configuration with Google OAuth
  - `routes/`: API endpoints for buildings, tenants, invoices
  - `services/pdf-generator.tsx`: React PDF invoice generation
  - `db/store.ts`: In-memory data store
  
- **Client** (src/client/): React SPA with SSR
  - `pages/`: Login, Dashboard, Invoice Form
  - `components/`: UI components (shadcn/ui style)
  - `lib/auth.ts`: Better Auth client
  
- **Shared** (src/shared/): Types and schemas
  - `types.ts`: TypeScript types
  - `schemas.ts`: Zod validation schemas

## Key Patterns
1. **Authentication**: Better Auth with Google OAuth, protected routes
2. **Type-safe API**: Hono RPC pattern with full TypeScript inference
3. **State Management**: TanStack Query for server state
4. **Form Handling**: TanStack Form with Zod validation
5. **PDF Generation**: React PDF for invoice exports
6. **Testing**: TDD with E2E tests first, then unit tests

## Development Notes
- Path alias `@/` configured for `src/`
- In-memory database for MVP (ready for real DB)
- Mock Google OAuth credentials in auth config
- Tests follow Canon TDD principles