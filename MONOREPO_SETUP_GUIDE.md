# Monorepo Setup Guide - Simplifying Leasy

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

#### Update apps/client/tsconfig.json:

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

#### Update apps/server/tsconfig.json:

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

#### Update apps/client/package.json:

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

#### Update apps/server/package.json:

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