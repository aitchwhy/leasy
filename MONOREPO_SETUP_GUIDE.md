# Monorepo Setup Guide - Simplifying Leasy

## Minimal

# Minimal Monorepo Setup

## Current Issues Found

⚠️ **Critical: Server app is missing package.json file!**

The server directory exists but has no package.json, which breaks the monorepo workspace setup.

## Quick Fix (2 minutes)

### 1. Create the missing server package.json

```bash
# THIS IS CRITICAL - Server has no package.json!
cat > apps/server/package.json << 'EOF'
{
  "name": "@leasy/server",
  "version": "1.0.0",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "bun run --watch src/index.ts --port 4000",
    "build": "echo 'No build step needed for Bun'"
  },
  "dependencies": {
    "hono": "^4.8.10"
  }
}
EOF
```

### 2. Clean up and simplify client (optional)

The client has many dependencies. For minimal setup:

```json
{
  "name": "@leasy/client",
  "version": "1.0.0",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "react": "^19.1.1",
    "react-dom": "^19.1.1"
  },
  "devDependencies": {
    "@types/react": "^19.1.9",
    "@types/react-dom": "^19.1.7",
    "@vitejs/plugin-react": "^4.7.0",
    "autoprefixer": "^10.4.21",
    "postcss": "^8.5.6",
    "tailwindcss": "^3.4.17",
    "vite": "^6.3.5"
  }
}
```

### 3. Clean and reinstall

```bash
# Remove any existing node_modules and lock files
rm -rf node_modules apps/*/node_modules
rm -f bun.lock package-lock.json

# Install everything fresh (creates single bun.lock at root)
bun install

# Verify concurrently is installed (should already be in root devDependencies)
# If not: bun add -d concurrently
```

### 4. Run the monorepo

```bash
# Start both apps with one command
bun run dev

# Client runs on http://localhost:3000
# Server runs on http://localhost:4000
```

## Verify Everything Works

After setup, you should have:

✅ **Server package.json exists** at `apps/server/package.json`
✅ **Single bun.lock** at project root
✅ **Single node_modules** at project root
✅ **Both apps start** with `bun run dev`

## All Available Commands

```bash
bun run dev        # Start client + server
bun run build      # Build both apps
bun run test       # Run Playwright tests
bun run clean      # Remove all node_modules
bun run reinstall  # Clean and reinstall everything
```

## Common Issues

**Error: "Cannot find module '@leasy/server'"**

- The server package.json is missing. Run step 1 to create it.

**Error: "concurrently: command not found"**

```bash
bun add -d concurrently
```

**Ports already in use:**

```bash
# Kill any running processes
pkill -f "bun|vite|node"
```

## Ultra-Minimal Alternative

If you don't want any monorepo setup, just run in two terminals:

```bash
# Terminal 1 - Client
cd apps/client && bun run dev

# Terminal 2 - Server
cd apps/server && bun run --watch src/index.ts --port 4000
```

But the monorepo setup is worth it for single-command development.

## Nx vs Minimal Approach Comparison

### Nx Monorepo Tool

**Pros:**

- ✅ **Intelligent caching** - Only rebuilds what changed (great for large projects)
- ✅ **Task orchestration** - Automatically runs tasks in dependency order
- ✅ **Affected commands** - Test/build only what's affected by changes
- ✅ **Nx Cloud** - Distributed caching across team/CI (you have nxCloudId configured)
- ✅ **Generators** - Scaffold new apps/libs with consistent structure
- ✅ **Dependency graph** - Visualize project dependencies (`nx graph`)
- ✅ **Plugin ecosystem** - Vite, React, ESLint plugins with best practices
- ✅ **Incremental builds** - Speed up CI/CD pipelines significantly

**Cons:**

- ❌ **Complexity overhead** - 21MB+ dependency, learning curve
- ❌ **Configuration files** - nx.json, project.json per app, more to maintain
- ❌ **Overkill for simple projects** - Your 2-app setup doesn't need orchestration
- ❌ **Bun compatibility** - Nx primarily designed for npm/yarn/pnpm
- ❌ **Mental overhead** - Adds concepts like executors, generators, affected
- ❌ **Tool lock-in** - Harder to migrate away once deeply integrated

### Minimal Bun Workspace Approach

**Pros:**

- ✅ **Dead simple** - Just package.json files and bun workspaces
- ✅ **Zero config** - Works out of the box with bun
- ✅ **Fast installs** - Bun is significantly faster than npm/yarn
- ✅ **Lightweight** - No extra tools or abstractions
- ✅ **Native TypeScript** - Bun runs TS directly, no build step for server
- ✅ **Easy to understand** - Standard npm workspace concepts
- ✅ **No lock-in** - Easy to migrate to any other tool later

**Cons:**

- ❌ **No caching** - Rebuilds everything every time
- ❌ **Manual orchestration** - You manage task dependencies
- ❌ **No affected detection** - Tests/builds run for all apps
- ❌ **Basic scripts only** - Using concurrently for parallel tasks
- ❌ **No visualization** - Can't see project dependency graph
- ❌ **Scales poorly** - Gets messy with 10+ apps/packages

### Recommendation for Your Project

**Use the Minimal Approach (current setup) because:**

1. **Project Size** - You have 2 apps (client/server), Nx benefits kick in at 5+ apps
2. **Team Size** - Small team doesn't need distributed caching
3. **Build Speed** - Bun is already fast, your apps are small
4. **Complexity** - Your apps are simple, no complex dependency chains
5. **Learning Curve** - Get building immediately vs learning Nx concepts

**Consider Nx when you have:**

- 5+ applications or packages
- Multiple developers needing shared cache
- Complex build pipelines with many steps
- Need for consistent code generation
- CI/CD time becomes a bottleneck
- Monorepo with different tech stacks (Go, Python, etc.)

### Quick Migration Path

**If you want to try Nx later:**

```bash
# Keep your current structure, just add Nx
npx nx@latest init

# Or full Nx workspace setup
npx create-nx-workspace@latest --preset=npm --packageManager=bun
```

**Current Nx in your project:**

- You have `nx` installed and `nx.json` with cloud ID
- But no actual Nx configuration for apps
- This gives you worst of both worlds (dependency without benefits)

**To remove unused Nx:**

```bash
bun remove nx
rm nx.json
```

### Bottom Line

For a simple client/server monorepo like yours, the minimal Bun workspace approach is perfect. It's fast, simple, and maintainable. Save Nx for when you actually need its advanced features - you can always add it later without restructuring.

---

## Current Issues

Your monorepo currently has several issues that make it harder to maintain:

1. **Mixed Package Managers**: Both npm (`package-lock.json`) and bun (`bun.lock`) files exist
2. **Duplicate Dependencies**: Each app has its own `node_modules` and lock files
3. **Inconsistent Scripts**: Root `package.json` only runs server, not coordinated development
4. **Legacy Artifacts**: Old documentation and test files from previous implementation
5. **No Shared Code Structure**: No place for shared types or utilities

## Migration Steps

Follow these steps in order. Each step includes verification to ensure it worked correctly.

### Step 1: Backup Current State

```bash
# Create a backup branch
git checkout -b backup-before-monorepo-cleanup
git add -A
git commit -m "Backup before monorepo restructure"
git checkout main
```

### Step 2: Clean Package Manager Artifacts

```bash
# Remove npm artifacts
rm -f package-lock.json
rm -f apps/client/package-lock.json
rm -f apps/server/package-lock.json

# Remove duplicate lock files
rm -f apps/server/bun.lock
rm -f apps/client/bun.lock

# Clean all node_modules
rm -rf node_modules
rm -rf apps/client/node_modules
rm -rf apps/server/node_modules
```

**Verify**: Run `ls -la` in root and each app directory - no `node_modules` or lock files should exist except root `bun.lock`

### Step 3: Update Root package.json

Replace your root `package.json` with:

```json
{
  "name": "leasy",
  "version": "1.0.0",
  "type": "module",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "concurrently \"bun run dev:server\" \"bun run dev:client\"",
    "dev:server": "cd apps/server && bun run --watch src/index.ts --port 4000",
    "dev:client": "cd apps/client && bun run dev",
    "build": "bun run build:client && bun run build:server",
    "build:client": "cd apps/client && bun run build",
    "build:server": "cd apps/server && bun run build",
    "test": "playwright test",
    "test:ui": "playwright test --ui",
    "typecheck": "tsc -b",
    "clean": "rm -rf node_modules apps/*/node_modules packages/*/node_modules",
    "reinstall": "bun run clean && bun install"
  },
  "devDependencies": {
    "@playwright/test": "^1.48.2",
    "@types/bun": "latest",
    "@types/node": "^22.10.5",
    "@typescript-eslint/eslint-plugin": "^8.20.0",
    "@typescript-eslint/parser": "^8.20.0",
    "concurrently": "^9.1.2",
    "eslint": "^9.18.0",
    "typescript": "^5.7.3",
    "vitest": "^2.1.8"
  }
}
```

### Step 4: Create Shared Package Structure

```bash
# Create packages directory
mkdir -p packages/shared/src

# Create shared package.json
cat > packages/shared/package.json << 'EOF'
{
  "name": "@leasy/shared",
  "version": "1.0.0",
  "type": "module",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "typecheck": "tsc --noEmit"
  }
}
EOF

# Create shared index file
cat > packages/shared/src/index.ts << 'EOF'
// Shared types and utilities
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  status: number;
}

export const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://api.leasy.com'
  : 'http://localhost:4000';
EOF

# Create shared tsconfig
cat > packages/shared/tsconfig.json << 'EOF'
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF
```

### Step 5: Create Base TypeScript Configuration

Create `tsconfig.base.json` in the root:

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "lib": ["ESNext"],
    "types": ["bun"]
  },
  "exclude": ["node_modules", "dist", "build", ".next", "out"]
}
```

Update root `tsconfig.json`:

```json
{
  "files": [],
  "references": [
    { "path": "./apps/client" },
    { "path": "./apps/server" },
    { "path": "./packages/shared" }
  ]
}
```

### Step 6: Update App Configurations

#### Update apps/client/tsconfig.json

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "lib": ["ESNext", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "types": ["vite/client", "node"],
    "paths": {
      "@/*": ["./src/*"],
      "@leasy/shared": ["../../packages/shared/src"]
    }
  },
  "include": ["src/**/*", "vite.config.ts"],
  "exclude": ["node_modules", "dist"],
  "references": [
    { "path": "../../packages/shared" }
  ]
}
```

#### Update apps/server/tsconfig.json

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "lib": ["ESNext"],
    "jsx": "react-jsx",
    "jsxImportSource": "hono/jsx",
    "types": ["@cloudflare/workers-types", "bun"],
    "paths": {
      "@leasy/shared": ["../../packages/shared/src"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"],
  "references": [
    { "path": "../../packages/shared" }
  ]
}
```

### Step 7: Update App package.json Files

#### Update apps/client/package.json

```json
{
  "name": "@leasy/client",
  "version": "1.0.0",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@leasy/shared": "workspace:*",
    "@tanstack/react-query": "^5.84.1",
    "hono": "^4.8.12",
    "react": "^19.1.1",
    "react-dom": "^19.1.1"
  },
  "devDependencies": {
    "@types/react": "^19.1.9",
    "@types/react-dom": "^19.1.7",
    "@vitejs/plugin-react": "^4.7.0",
    "autoprefixer": "^10.4.21",
    "postcss": "^8.5.6",
    "tailwindcss": "^3.4.17",
    "vite": "^6.3.5"
  }
}
```

#### Update apps/server/package.json

```json
{
  "name": "@leasy/server",
  "version": "1.0.0",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "bun run --watch src/index.ts --port 4000",
    "build": "tsc -b",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@leasy/shared": "workspace:*",
    "hono": "^4.8.10",
    "zod": "^3.24.1"
  },
  "devDependencies": {
    "@cloudflare/workers-types": "^4.20250109.0"
  }
}
```

### Step 8: Install Dependencies

```bash
# Install with bun (creates single lock file)
bun install

# Install concurrently for parallel dev servers
bun add -d concurrently
```

**Verify**:

- Only one `bun.lock` should exist at root
- `node_modules` only at root (check with `find . -name node_modules -type d`)

### Step 9: Clean Legacy Files

```bash
# Archive old documentation (optional - keep for reference)
mkdir -p archive
mv docs archive/ 2>/dev/null || true
mv data archive/ 2>/dev/null || true

# Or remove them entirely
# rm -rf docs data

# Clean up test results
rm -rf playwright-report test-results

# Remove unused files
rm -f repomix-output.xml
```

### Step 10: Test the Setup

```bash
# Test installation
bun install

# Test development servers
bun run dev

# Test type checking
bun run typecheck

# Test builds
bun run build
```

## Verification Checklist

After completing all steps, verify:

- [ ] Only one `bun.lock` file exists (at root)
- [ ] Only one `node_modules` folder exists (at root)
- [ ] `bun run dev` starts both client and server
- [ ] Client runs on port 3000, server on port 4000
- [ ] `bun run typecheck` passes without errors
- [ ] `bun run build` completes successfully
- [ ] No npm lock files exist anywhere

## Using the Shared Package

Example of importing from shared package in your apps:

```typescript
// In apps/client/src/api.ts
import { ApiResponse, API_BASE_URL } from '@leasy/shared';

// In apps/server/src/handlers.ts
import { ApiResponse } from '@leasy/shared';
```

## Troubleshooting

### Issue: "Cannot find module '@leasy/shared'"

**Solution**: Ensure you've run `bun install` after creating the shared package.

### Issue: TypeScript errors about paths

**Solution**: Make sure all tsconfig files extend from `tsconfig.base.json` and have proper `references`.

### Issue: Dev servers not starting

**Solution**: Install concurrently: `bun add -d concurrently`

### Issue: Duplicate dependencies installed

**Solution**: Run `bun run clean && bun install` to clear and reinstall.

## Rollback Plan

If something goes wrong:

```bash
# Restore from backup branch
git checkout backup-before-monorepo-cleanup

# Or reset to previous commit
git reset --hard HEAD~1

# Reinstall dependencies
rm -rf node_modules apps/*/node_modules
bun install
```

## Benefits After Migration

1. **Single lock file**: Faster installs, consistent dependencies
2. **Shared code**: Common types and utilities in one place
3. **Cleaner scripts**: Coordinated development with single command
4. **Better TypeScript**: Proper project references and inheritance
5. **Simpler maintenance**: Standard monorepo structure

## Next Steps

After completing this setup:

1. Add more shared utilities to `packages/shared` as needed
2. Consider adding a `packages/ui` for shared React components
3. Set up consistent linting rules at root level
4. Add pre-commit hooks with Husky for code quality
5. Configure CI/CD to leverage monorepo structure
