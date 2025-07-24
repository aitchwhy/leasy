# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Leasy is a minimal invoice dashboard demo app for commercial building owners. Built with Hono + Vite + React, it displays mock invoice data and a basic form interface.

## Development Commands
```bash
npm run dev        # Start Vite development server (port 5173)
npm run build      # Build client and server bundles
npm run typecheck  # TypeScript type checking
npm run test:e2e   # Run E2E tests with Playwright
npm run test:e2e:ui # Run E2E tests with UI interface
```

## Architecture
- **Server** (src/server/): Hono server with REST API
  - `index.tsx`: Main server with routes
  - `api.ts`: REST API endpoints for buildings, leases, and invoices
  - `renderer.tsx`: HTML renderer
  - `db/store.ts`: In-memory data storage with seed data
  
- **Client** (src/client/): React SPA with TanStack Query
  - `pages/`: Dashboard and Invoice Form pages
  - `components/`: Layout and shadcn/ui components
  - `hooks/useApi.ts`: React Query hooks for API integration
  - `app.tsx`: Main app with routing
  
- **Shared** (src/shared/): Type definitions
  - `types.ts`: Zod schemas and TypeScript types for data models
  
## Key Features
- Buildings and leases management via REST API
- Invoice generation with form validation
- Real-time data fetching with React Query
- Toast notifications for user feedback
- Responsive design with Tailwind CSS
- Comprehensive E2E test coverage

## API Endpoints
- `GET /api/buildings` - Returns all buildings for the current owner
- `GET /api/leases?building_id={id}` - Returns leases for a specific building
- `POST /api/invoices` - Creates a new invoice (body: `{ lease_id, issue_date?, due_date? }`)
- `GET /api/invoices/{id}` - Returns a specific invoice
- `GET /api/healthz` - Health check endpoint

## Development Notes
- Path alias `@/` configured for `src/`
- In-memory data storage (resets on server restart)
- No authentication - all pages are public
- Minimal UI components from shadcn/ui pattern
- All acceptance criteria from PRD are tested via E2E tests