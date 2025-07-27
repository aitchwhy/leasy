# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Leasy is a modern invoice generator web app for commercial building owners managing multiple tenants. Built with React + Hono + Vite, it provides a complete invoice management system with authentication and PDF export capabilities.

## Development Commands
```bash
# Development
npm run dev         # Start Vite dev server (port 5173)
npm run preview     # Preview production build

# Build & Deploy
npm run build       # Build client and server bundles
npm run deploy      # Deploy to Cloudflare Workers

# Testing
npm run test        # Run unit tests with Vitest
npm run test:e2e    # Run E2E tests with Playwright
npm run test:e2e:ui # Run E2E tests with UI interface
npm run test:all    # Run all tests
npm run typecheck   # TypeScript type checking
```

## Architecture
- **Server** (src/server/): Hono server with REST API on Cloudflare Workers
  - `index.tsx`: Main server with routes
  - `api/`: Modular API endpoints
    - `auth.ts`: Mock authentication endpoints
    - `dashboard.ts`: Dashboard data endpoints
    - `invoices.ts`: Invoice CRUD and generation
    - `tenants.ts`: Tenant management
  - `renderer.tsx`: HTML renderer for React app
  - `db/`: In-memory data storage
    - `store.ts`: Main data store with seed data
    - `pnl-data.ts`: PNL building revenue data
  
- **Client** (src/client/): React 19 SPA with TanStack Query
  - `pages/`: Dashboard, Invoice Form, Login pages
  - `components/`: Layout and shadcn/ui components
  - `hooks/useApi.ts`: React Query hooks for API integration
  - `lib/`: Auth client setup (Better Auth)
  - `mocks/`: MSW for development
  - `app.tsx`: Main app with routing
  
- **Shared** (src/shared/): Type definitions
  - `types.ts`: Zod schemas and TypeScript types for data models
  
## Key Features
- 🔐 **Authentication**: Mock login system (Google OAuth ready)
- 📊 **Dashboard**: Overview with building metrics (₩27,333,581 monthly revenue)
- 🏢 **Multi-tenant**: Manage multiple buildings and tenants
- 📄 **Invoice Generation**: Create invoices with validation
- 📑 **PDF Export**: Generate downloadable PDF invoices (placeholder)
- 🎨 **Modern UI**: Tailwind CSS + shadcn/ui components
- 🔄 **Real-time Updates**: React Query for data fetching

## API Endpoints
### Authentication
- `POST /api/auth/mock-login` - Mock authentication (returns session token)

### Dashboard & Buildings
- `GET /api/dashboard` - Building overview data with metrics
- `GET /api/buildings` - List all buildings for current owner
- `GET /api/leases?building_id={id}` - Get leases for a specific building

### Tenants
- `GET /api/tenants` - List all tenants with billing information

### Invoices
- `POST /api/invoices` - Create new invoice
- `POST /api/invoices/generate` - Generate multiple invoices
- `GET /api/invoices/{id}` - Get specific invoice
- `POST /api/invoices/{id}/generate-pdf` - Generate PDF (placeholder)
- `GET /api/invoices/{id}/pdf` - Download PDF (placeholder)

### Health
- `GET /api/healthz` - Health check endpoint

## Environment Setup
Create a `.env` file for OAuth configuration:
```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## Development Notes
- Path alias `@/` maps to `src/` directory
- TypeScript configured for ESNext with strict mode
- In-memory data storage (resets on server restart)
- Mock authentication with localStorage token storage
- PDF generation currently returns placeholder response
- Single user system (Il Keun Lee) for MVP
- Comprehensive E2E test coverage with Playwright
- Edge-optimized for Cloudflare Workers deployment

## Testing Strategy
- Unit tests for utilities and hooks
- E2E tests cover all user flows and acceptance criteria
- Test server runs on port 5173 (same as dev)
- Use `npm run test:e2e:ui` for interactive debugging