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
- **Server** (src/server/): Minimal Hono server
  - `index.tsx`: Main server with routes
  - `api.ts`: Simple health check API
  - `renderer.tsx`: HTML renderer
  
- **Client** (src/client/): React SPA
  - `pages/`: Dashboard and Invoice Form pages
  - `components/`: Layout and shadcn/ui components
  - `app.tsx`: Main app with routing
  
## Key Features
- Static dashboard with mock invoice data
- Basic invoice form (display only, no submission)
- Simple navigation between dashboard and form
- Responsive design with Tailwind CSS

## Development Notes
- Path alias `@/` configured for `src/`
- Mock data only - no database or API integration
- No authentication - all pages are public
- Minimal UI components from shadcn/ui pattern