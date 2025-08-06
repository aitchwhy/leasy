# Development Guide

## Prerequisites

- [Bun](https://bun.sh) v1.1.47 or higher
- Node.js v22+ (for some dev tools)
- VS Code (recommended) or any text editor

## Initial Setup

```bash
# Clone the repository
git clone <repo-url>
cd leasy

# Install dependencies
bun install

# Start development server
bun run dev
```

The server will start at http://localhost:3000

## Development Workflow

### 1. Code Changes

The server runs with hot reload enabled:

- Edit files in `apps/server/src/`
- Server automatically restarts
- No manual restart needed

### 2. Code Quality

Before committing, ensure code quality:

```bash
# Fix linting issues
bun run lint:fix

# Format code
bun run format

# Check types
bun run typecheck
```

### 3. Testing

Run tests before pushing:

```bash
# Unit tests
bun run test:server

# E2E tests
bun run test:e2e

# All tests
bun run test
```

### 4. Building

Build for production:

```bash
bun run build
```

## Project Structure

```
apps/server/src/
├── index.ts        # Main server file
├── index.test.ts   # Unit tests
├── constants.ts    # Constants
└── db.json        # Mock data
```

## VS Code Setup

### Extensions

Recommended extensions:

- ESLint (`dbaeumer.vscode-eslint`)
- Prettier (`esbenp.prettier-vscode`)
- Bun for VS Code (`oven-sh.bun-vscode`)

### Settings

Project includes `.vscode/settings.json` with:

- Format on save enabled
- Prettier as default formatter
- ESLint auto-fix on save

## Environment Variables

Currently no environment variables are used. To add:

1. Create `.env` file:

```bash
PORT=3000
NODE_ENV=development
```

2. Access in code:

```typescript
const port = process.env.PORT || 3000;
```

## Database

Currently uses a mock JSON database at `apps/server/src/db.json`.

To add a real database:

1. Install database client (e.g., `bun add postgres`)
2. Create database connection
3. Replace mock data calls

## Adding Features

### New Endpoint

1. Add to `apps/server/src/index.ts`:

```typescript
app.get("/new-endpoint", (c) => {
  return c.json({ message: "Hello" });
});
```

2. Add test to `apps/server/src/index.test.ts`:

```typescript
test("GET /new-endpoint", async () => {
  const res = await app.request("/new-endpoint");
  expect(res.status).toBe(200);
});
```

3. Run tests:

```bash
bun run test:server
```

### Middleware

Add middleware to `apps/server/src/index.ts`:

```typescript
import { cors } from "hono/cors";
import { logger } from "hono/logger";

app.use("*", cors());
app.use("*", logger());
```

## Debugging

### Server Logs

Server logs appear in the terminal where `bun run dev` is running.

### Test Debugging

```bash
# Run tests with verbose output
bun run test:server -- --reporter=verbose

# Run specific test
bun run test:server -- -t "test name"
```

### VS Code Debugging

Add to `.vscode/launch.json`:

```json
{
  "type": "bun",
  "request": "launch",
  "name": "Debug Server",
  "program": "${workspaceFolder}/apps/server/src/index.ts",
  "cwd": "${workspaceFolder}/apps/server",
  "stopOnEntry": false
}
```

## Common Issues

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Bun Lock File Issues

```bash
# Clear and reinstall
rm bun.lock
bun install
```

### TypeScript Errors

```bash
# Check for errors
bun run typecheck

# Restart TS server in VS Code
Cmd+Shift+P > "TypeScript: Restart TS Server"
```

## Performance Tips

1. **Use Bun built-ins** - Prefer Bun's native APIs
2. **Avoid large dependencies** - Keep bundle size small
3. **Use streaming** - For large responses
4. **Cache responses** - Add caching headers

## Deployment

For production deployment:

1. Build the project:

```bash
bun run build
```

2. Run production server:

```bash
bun run apps/server/dist/index.js
```

3. Use process manager (PM2, systemd, etc.)

## Resources

- [Bun Documentation](https://bun.sh/docs)
- [Hono Documentation](https://hono.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [ESLint Rules](https://eslint.org/docs/rules)
- [Prettier Options](https://prettier.io/docs/en/options.html)
