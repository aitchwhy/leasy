# Leasy - Minimal Bun/Hono API Template

A minimal monorepo template using Bun, Hono, and TypeScript with ESLint + Prettier integration.

## Quick Start

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Run tests
bun run test

# Type checking
bun run typecheck
```

## Features

✅ **Bun Runtime** - Fast JavaScript runtime and package manager  
✅ **Hono Framework** - Lightweight web framework optimized for edge  
✅ **TypeScript** - Full type safety with strict mode  
✅ **ESLint + Prettier** - Integrated linting and formatting  
✅ **Vitest** - Fast unit testing framework  
✅ **Playwright** - E2E testing setup  
✅ **Monorepo Ready** - Workspace structure for future expansion

## Tech Stack

| Category       | Technology                                   | Purpose                              |
| -------------- | -------------------------------------------- | ------------------------------------ |
| **Runtime**    | [Bun](https://bun.sh)                        | JavaScript runtime & package manager |
| **Framework**  | [Hono](https://hono.dev)                     | Web framework                        |
| **Language**   | [TypeScript](https://www.typescriptlang.org) | Type safety                          |
| **Testing**    | [Vitest](https://vitest.dev)                 | Unit testing                         |
| **Testing**    | [Playwright](https://playwright.dev)         | E2E testing                          |
| **Linting**    | [ESLint](https://eslint.org)                 | Code quality                         |
| **Formatting** | [Prettier](https://prettier.io)              | Code formatting                      |

## Project Structure

```
leasy/
├── apps/
│   └── server/                 # Hono API server
│       ├── src/
│       │   ├── index.ts       # Main server file
│       │   ├── index.test.ts  # Unit tests
│       │   ├── constants.ts   # Constants
│       │   └── db.json        # Mock database
│       ├── package.json
│       └── vitest.config.ts
├── tests/
│   └── e2e/                   # Playwright E2E tests
│       └── smoke.spec.ts
├── .vscode/                   # VS Code settings
├── eslint.config.ts          # ESLint configuration
├── .prettierrc               # Prettier configuration
├── package.json              # Root workspace config
└── tsconfig.json             # TypeScript config
```

## API Endpoints

The server provides these endpoints:

- `GET /` - Health check (returns "OK")
- `GET /db` - Returns full mock database
- `GET /buildings` - Returns list of buildings

## Development Commands

### Core Commands

```bash
# Development
bun run dev                    # Start server with hot reload (port 3000)
bun run build                  # Build for production

# Testing
bun run test                   # Run all tests
bun run test:server           # Run server unit tests
bun run test:watch            # Run tests in watch mode
bun run test:e2e              # Run Playwright E2E tests

# Code Quality
bun run typecheck             # TypeScript type checking
bun run lint                  # ESLint check
bun run lint:fix              # ESLint auto-fix
bun run format                # Prettier format all files
bun run format:check          # Check formatting

# Maintenance
bun run clean                 # Remove build artifacts and node_modules
```

### Direct Server Commands

```bash
cd apps/server
bun run dev                   # Run server directly
bun run test                  # Run server tests
bun run test:watch           # Watch mode for tests
```

## VS Code Integration

The project includes VS Code settings for:

- Format on save with Prettier
- ESLint integration
- TypeScript IntelliSense

## Testing

### Unit Tests (Vitest)

```bash
bun run test:server
# or
cd apps/server && bun run test
```

### E2E Tests (Playwright)

```bash
bun run test:e2e              # Run all E2E tests
bun run test:e2e -- --ui      # Open Playwright UI
bun run test:e2e -- --debug   # Debug mode
```

## Adding New Features

### Add a New Endpoint

1. Add the endpoint in `apps/server/src/index.ts`
2. Add tests in `apps/server/src/index.test.ts`
3. Run tests: `bun run test:server`

### Add a Client App (Future)

The monorepo structure is ready for a client app:

```bash
mkdir -p apps/client
# Add package.json with workspace protocol
# Update root package.json dev script
```

## Configuration Files

- `eslint.config.ts` - ESLint with Prettier integration
- `.prettierrc` - Prettier formatting rules
- `.prettierignore` - Files to ignore for formatting
- `tsconfig.json` - TypeScript configuration
- `vitest.config.ts` - Vitest test configuration
- `playwright.config.ts` - Playwright E2E configuration

## Environment

- **Bun**: 1.1.47+
- **Node**: 22.0.0+ (for some dev tools)
- **TypeScript**: 5.9+

## License

MIT
