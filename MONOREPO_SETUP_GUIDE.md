# Monorepo Setup Guide

This guide explains the current monorepo structure and how to expand it.

## Current Structure

This is a minimal Bun workspace monorepo with:

- **Server app** at `apps/server/` - Hono API server
- **E2E tests** at `tests/e2e/` - Playwright tests
- **Workspace root** - Shared dev dependencies and scripts

## Quick Start

```bash
# Install all dependencies (creates single bun.lock at root)
bun install

# Start development server
bun run dev

# Run tests
bun run test
```

## Workspace Configuration

The monorepo uses Bun workspaces defined in root `package.json`:

```json
{
  "workspaces": ["apps/*", "packages/*"]
}
```

This ensures:

- ✅ Single `bun.lock` file at root
- ✅ Single `node_modules` at root
- ✅ Shared dev dependencies
- ✅ Consistent versions across packages

## Available Scripts

All scripts are defined at the root level:

```bash
bun run dev          # Start server with hot reload
bun run build        # Build all packages
bun run test         # Run all tests
bun run lint         # ESLint check
bun run format       # Prettier format
bun run typecheck    # TypeScript check
bun run clean        # Clean all build artifacts
```

## Adding a Client App

The structure is ready for a client app:

### 1. Create Client Structure

```bash
mkdir -p apps/client/src
```

### 2. Create Client package.json

```json
{
  "name": "@leasy/client",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.0",
    "vite": "^5.0.0"
  }
}
```

### 3. Update Root Dev Script

In root `package.json`, update the dev script to run both:

```json
{
  "scripts": {
    "dev": "concurrently \"bun run dev:server\" \"bun run dev:client\"",
    "dev:server": "cd apps/server && bun run dev",
    "dev:client": "cd apps/client && bun run dev"
  }
}
```

### 4. Install Dependencies

```bash
bun install
bun add -d concurrently  # For parallel execution
```

## Adding Shared Packages

Create shared code packages:

### 1. Create Shared Package

```bash
mkdir -p packages/shared/src

cat > packages/shared/package.json << 'EOF'
{
  "name": "@leasy/shared",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts"
}
EOF
```

### 2. Use in Apps

```typescript
// In apps/server/package.json
{
  "dependencies": {
    "@leasy/shared": "workspace:*"
  }
}

// In code
import { something } from "@leasy/shared";
```

## TypeScript Configuration

The project uses TypeScript project references for better monorepo support:

- `tsconfig.json` at root - References all packages
- `tsconfig.json` in each package - Package-specific config

## ESLint & Prettier

Code quality tools are configured at the root level:

- `eslint.config.ts` - ESLint 9 flat config
- `.prettierrc` - Prettier configuration
- `.prettierignore` - Files to skip

All packages inherit these configurations.

## VS Code Integration

The `.vscode/settings.json` provides:

- Format on save with Prettier
- ESLint auto-fix on save
- TypeScript IntelliSense from workspace

## Common Tasks

### Add a New Package

```bash
mkdir -p apps/new-app
# or
mkdir -p packages/new-package

# Create package.json with workspace protocol
# Run bun install to link
```

### Remove a Package

```bash
rm -rf apps/package-name
bun install  # Updates lockfile
```

### Check Workspace Dependencies

```bash
bun pm ls  # List all packages and dependencies
```

### Clean Everything

```bash
bun run clean  # Remove all node_modules and dist
bun install    # Reinstall fresh
```

## Benefits of This Structure

1. **Single Install** - One `bun install` for everything
2. **Shared Dependencies** - No duplication
3. **Consistent Versions** - All packages use same versions
4. **Fast Installs** - Bun is significantly faster than npm/yarn
5. **Type Safety** - TypeScript project references
6. **Code Sharing** - Easy to share code via packages
7. **Scalable** - Easy to add more apps/packages

## Troubleshooting

### "Cannot find module" Errors

```bash
# Ensure workspace is installed
bun install

# Check package name matches
ls apps/*/package.json packages/*/package.json
```

### Multiple node_modules Folders

```bash
# Clean and reinstall
bun run clean
bun install
```

### Port Conflicts

```bash
# Kill existing processes
pkill -f "bun|node|vite"

# Or use different ports in package.json scripts
```

## Future Expansion Ideas

- **packages/ui** - Shared React components
- **packages/types** - Shared TypeScript types
- **packages/utils** - Common utilities
- **apps/docs** - Documentation site
- **apps/admin** - Admin dashboard
- **apps/mobile** - React Native app

The monorepo structure makes it easy to add any of these when needed.
