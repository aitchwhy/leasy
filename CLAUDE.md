# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Leasy is a minimal Bun-based monorepo template with a Hono server backend. It provides a clean starting point for building APIs with TypeScript, ESLint, and Prettier pre-configured.

## Development Commands

```bash
# Development
bun run dev                           # Start server on port 3000 (watches for changes)
cd apps/server && bun run --watch src/index.ts  # Direct server development

# Testing
bun run test                          # Run all tests (currently server only)
bun run test:server                   # Run server unit tests with Vitest
bun run test:watch                    # Run tests in watch mode
bun run test:e2e                      # Run Playwright E2E tests
bun run test:e2e -- tests/e2e/smoke.spec.ts  # Run specific E2E test file

# Type Checking & Build
bun run typecheck                     # TypeScript type checking across all packages
bun run build                         # Build all packages

# Code Quality (NEW)
bun run lint                          # ESLint check all TypeScript files
bun run lint:fix                      # Auto-fix ESLint issues
bun run format                        # Prettier format all files
bun run format:check                  # Check if files are formatted

# Cleanup
bun run clean                         # Remove dist, node_modules across workspace
```

### Running Individual Server Tests

```bash
cd apps/server && bun run test       # Run server tests directly
cd apps/server && bun run test:watch # Watch mode for server tests
```

### Playwright E2E Testing

```bash
bun run test:e2e                     # Run all E2E tests
bun run test:e2e -- --ui             # Open Playwright UI mode
bun run test:e2e -- --headed         # Run tests in headed browser
bun run test:e2e -- --debug          # Debug mode
npx playwright show-report           # View last HTML report
```

## Architecture

### Monorepo Structure

```
leasy/
├── apps/
│   └── server/                # Hono backend (port 3000)
│       ├── src/
│       │   ├── index.ts       # Main server with endpoints
│       │   ├── index.test.ts  # Vitest unit tests
│       │   ├── constants.ts   # Constants definitions
│       │   └── db.json        # Mock database
│       ├── package.json
│       └── vitest.config.ts   # Vitest configuration
├── tests/
│   └── e2e/                   # Playwright E2E tests
│       └── smoke.spec.ts      # Basic health check test
├── eslint.config.ts           # ESLint flat config with Prettier
├── .prettierrc                # Prettier configuration
└── .vscode/                   # VS Code workspace settings
    └── settings.json          # Format on save, ESLint integration
```

### Technology Stack

- **Runtime**: Bun 1.1.47+ (workspace-based monorepo)
- **Server**: Hono framework with TypeScript
- **Testing**:
  - Vitest for unit/integration tests
  - Playwright for E2E tests
- **Code Quality**:
  - ESLint 9+ with flat config
  - Prettier 3.6+ as ESLint plugin
  - TypeScript 5.9+ with strict mode
- **Package Management**: Bun workspaces

### Current Endpoints

- `GET /` - Health check returning "OK"
- `GET /db` - Returns full mock database
- `GET /buildings` - Returns list of buildings from mock data

### Test Configuration

- **Playwright**: Tests in `/tests/e2e/`, runs server on port 3000
- **Vitest**: Tests in `src/**/*.test.ts`, Node environment
- **Coverage**: Server unit tests and E2E smoke tests

## Code Quality Setup

### ESLint + Prettier Integration

The project uses ESLint 9 flat config with Prettier as a plugin:

- ESLint handles code quality rules
- Prettier handles formatting through ESLint
- `eslint-config-prettier` prevents rule conflicts
- Supports TypeScript, JSON, and YAML files

### VS Code Integration

- **Format on Save**: Enabled via Prettier extension
- **ESLint Auto-fix**: Runs on save
- **TypeScript**: Uses workspace version
- Settings in `.vscode/settings.json`

## Common Development Tasks

### Adding a New Endpoint

1. Add the endpoint in `apps/server/src/index.ts`
2. Write unit test in `apps/server/src/index.test.ts`
3. Run `cd apps/server && bun run test` to verify
4. Optionally add E2E test in `tests/e2e/`

### Running Tests Before Commit

```bash
bun run lint:fix              # Fix any linting issues
bun run format                # Format all files
bun run test:server           # Run unit tests
bun run test:e2e              # Run E2E tests
bun run typecheck             # Check types
```

### Debugging Failed Tests

```bash
# For unit tests
cd apps/server && bun run test:watch

# For E2E tests
bun run test:e2e -- --debug
bun run test:e2e -- --ui  # Interactive UI mode
```

## Current Features

- ✅ Minimal Hono API server
- ✅ TypeScript with strict mode
- ✅ ESLint + Prettier integration
- ✅ Vitest unit testing
- ✅ Playwright E2E testing
- ✅ VS Code format on save
- ✅ Bun workspace monorepo structure
- ✅ Hot reload development

## Known Issues

- None currently - project has been cleaned up and simplified

## Future Considerations

- Add client app when needed (structure ready)
- Add shared packages for common code
- Add database integration
- Add authentication
- Add API documentation (OpenAPI/Swagger)
