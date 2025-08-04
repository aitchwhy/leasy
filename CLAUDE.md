# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Leasy is a modern web application built with Hono (server) and React + Vite (client), deployed on Cloudflare Workers. The project is structured as a monorepo with separate client and server packages.

## Development Commands
```bash
# Development
bun run dev         # Start both client (port 5173) and server (port 8787)
bun run preview     # Preview production build

# Build & Deploy  
bun run build       # Build all packages for production
bun run deploy      # Deploy server to Cloudflare Workers

# Testing
bun run test        # Run all tests (unit and E2E)
bun run test:e2e    # Run E2E tests with Playwright
bun run test:e2e:ui # Run E2E tests with UI interface
bun run test:e2e:headed # Run E2E tests in headed mode

# Type Checking & Linting
bun run typecheck   # TypeScript type checking for all packages
bun run lint        # Lint all packages
bun run lint:fix    # Fix linting issues in all packages

# Package-specific commands
bun run --filter @leasy/client dev    # Run only client
bun run --filter @leasy/server dev    # Run only server
bun run --filter @leasy/server cf-typegen  # Generate Cloudflare Workers types
```

### Testing Individual Files
```bash
# Run specific test file
bun run test:e2e -- tests/e2e/auth.spec.ts

# Run tests in UI mode for debugging  
bun run test:e2e:ui

# Run specific unit test
bun run test:unit -- src/hooks/useApi.test.ts
```

## Architecture
### Monorepo Structure
- **Root**: Orchestrates the monorepo with Bun workspace configuration
- **packages/client/**: React frontend application
  - Built with Vite
  - React 19 with TypeScript
  - TanStack Query for data fetching
  - Tailwind CSS for styling
- **packages/server/**: Hono backend on Cloudflare Workers  
  - Lightweight edge-optimized framework
  - REST API endpoints
  - TypeScript with Cloudflare Workers types

### Key Architectural Decisions
1. **Edge-First**: Deployed on Cloudflare Workers for global distribution
2. **Type Safety**: Full TypeScript with strict mode enabled
3. **Monorepo**: Simplified dependency management with Bun workspaces
4. **Testing**: Comprehensive E2E tests with Playwright

### Path Configuration
- Use `@/` alias for imports (maps to src/ directory)
- Example: `import { useApi } from '@/hooks/useApi'`

## Testing Strategy
- **E2E Tests**: Playwright tests in `tests/e2e/` directory
  - Test server runs on port 5173 (same as dev)
  - Tests cover user flows and API endpoints
  - Use `npm run test:e2e:ui` for interactive debugging
- **Unit Tests**: Vitest for component and utility testing
  - Client tests with React Testing Library
  - Server tests for API endpoints

## Development Workflow (TDD Approach)
1. Write failing E2E test: `bun run test:e2e -- tests/e2e/feature.spec.ts`
2. Start dev servers: `bun run dev`
3. Implement feature until test passes
4. Refactor while keeping tests green
5. Check types: `bun run typecheck`
6. Fix linting: `bun run lint:fix`
7. Build: `bun run build`
8. Deploy: `bun run deploy`

## Current State
The project appears to be transitioning from a complex invoice management system to a simpler template. The existing E2E test infrastructure references features (authentication, dashboard, invoices) that may need to be updated or removed based on the new simplified architecture.