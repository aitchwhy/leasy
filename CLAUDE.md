# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Leasy is a minimal web application with separate client and server packages, transitioning from an invoice management system to a simpler template. Currently runs a basic "Hello World" implementation.

## Development Commands
```bash
# Development
bun run dev                    # Start server on port 4000
bun run --watch src/index.ts   # Watch mode for server development

# Testing
bun run test:e2e               # Run E2E tests with Playwright  
bun run test:e2e:ui            # Run E2E tests with UI interface
bun run test:e2e:headed        # Run E2E tests in headed mode

# Type Checking & Build
bun run typecheck              # TypeScript type checking (client only)
bun run build                  # Build client and server

# Linting (client only)
bun run lint                   # Lint client code
bun run lint:fix              # Fix linting issues

# Run specific test file
bun run test:e2e -- tests/e2e/health.spec.ts
```

## Architecture
### Monorepo Structure
```
leasy/
├── apps/
│   ├── client/          # React frontend (port 3000)
│   │   └── src/
│   │       ├── App.tsx  # Main component
│   │       └── main.tsx # Entry point
│   └── server/          # Hono backend (port 4000) 
│       └── src/
│           └── index.ts # Simple "Hello World" endpoint
└── tests/
    └── e2e/            # Playwright E2E tests
```

### Technology Stack
- **Runtime**: Bun (workspace-based monorepo)
- **Server**: Hono framework with TypeScript
- **Client**: React 19 + Vite + TypeScript + Tailwind CSS
- **Testing**: Playwright for E2E tests
- **State Management**: TanStack Query (available but not currently used)

### Key Configuration
- **Client Port**: 3000 (Vite dev server)
- **Server Port**: 4000 (Bun dev server)  
- **Proxy**: Client proxies `/api` requests to server on port 4000
- **Path Alias**: `@/` maps to `src/` directory in client
- **Test Base URL**: http://localhost:3000

## Testing Infrastructure
### Playwright Configuration
- Tests located in `/tests/e2e/`
- Base URL: http://localhost:3000
- Web server command: `bun run --filter @leasy/server dev`
- Single worker, no retries for consistent test runs

### Current Tests
- `health.spec.ts`: Basic server health check at root endpoint

## Current Implementation Status
### What's Working
- Basic server with "Hello World" endpoint at `/`
- Client showing "Hello World Hank 3" UI
- E2E test infrastructure configured and running
- TypeScript strict mode enabled

### What's Simplified/Removed
- No authentication system (was mock auth)
- No database or data persistence
- No API routes beyond health check
- No complex UI components or pages
- No PDF generation or invoice features

## Development Notes
### Server Development (apps/server/)
- Uses Hono JSX for potential server-side rendering
- Configured for Cloudflare Workers types (but not deployed)
- Minimal implementation - just health check endpoint

### Client Development (apps/client/)
- Vite configuration with React plugin
- Tailwind CSS configured but minimal usage
- TanStack Query available but not implemented
- Single App component with basic styling

### Important Considerations
- Project structure suggests Cloudflare Workers deployment intent but no wrangler.toml exists
- Legacy documentation in README references removed features (invoices, tenants, etc.)
- Test infrastructure over-provisioned for current simple implementation
- Both `npm` and `bun` commands referenced - project uses Bun exclusively