# Leasy - Property Management System

Leasy is an enterprise-grade property management system designed to streamline tenant management, lease tracking, utility readings, and invoice generation.

## 🚀 Tech Stack

- **Monorepo**: [Nx](https://nx.dev)
- **Frontend**: [Next.js](https://nextjs.org), [Tailwind CSS](https://tailwindcss.com), [Shadcn UI](https://ui.shadcn.com)
- **Backend**: [Hono](https://hono.dev), [Cloudflare Workers](https://workers.cloudflare.com)
- **Database**: [Neon](https://neon.tech) (PostgreSQL), [Drizzle ORM](https://orm.drizzle.team)
- **Auth**: [Clerk](https://clerk.com)
- **Package Manager**: [pnpm](https://pnpm.io)

## 📂 Project Structure

- **apps/**
  - `web`: Next.js frontend application.
  - `api`: Hono API server (Cloudflare Worker).
  - `etl`: Data ingestion and seeding scripts.
- **libs/**
  - `db`: Database schema, connection, and migrations.
  - `domain`: Shared domain types and business logic.
  - `validators`: Shared Zod schemas for validation.

## 🛠️ Getting Started

### Prerequisites

- Node.js v20+
- pnpm v9+

### Installation

```bash
pnpm install
```

### Environment Setup

Ensure you have the necessary `.env` files configured for:

- `apps/web`: Clerk keys, API URL.
- `apps/api`: Database URL, Clerk keys.
- `libs/db`: Database URL.

### Running Development Server

To start both the frontend and backend in development mode:

```bash
pnpm dev
```

### Build & Test

```bash
# Lint all projects
pnpm lint

# Typecheck all projects
pnpm typecheck

# Build all projects
pnpm build
```

## 🚢 CI/CD

The project uses GitHub Actions for CI/CD. The workflow is defined in `.github/workflows/ci.yml` and runs linting, typechecking, and building on every push to `main`.
