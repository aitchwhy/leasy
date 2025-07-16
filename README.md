# Leasy - Invoice Generator

A modern invoice generator web app for commercial building owners managing multiple tenants.

## Features

- 🔐 **Authentication** - Google OAuth login with Better Auth
- 📊 **Dashboard** - Overview of properties, tenants, and revenue metrics
- 📄 **Invoice Generation** - Create professional invoices with line items
- 📑 **PDF Export** - Generate downloadable PDF invoices
- 🏢 **Multi-tenant** - Manage multiple buildings and tenants
- 🎨 **Modern UI** - Clean interface built with Tailwind CSS

## Tech Stack

- **Frontend**: React 19 + TypeScript + TanStack Query + Tailwind CSS
- **Backend**: Hono.js + Cloudflare Workers
- **Auth**: Better Auth with Google OAuth
- **PDF**: React PDF
- **Testing**: Vitest + Playwright

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Google OAuth credentials (for authentication)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd leasy

# Install dependencies
npm install
```

### Environment Setup

Create a `.env` file in the root directory:

```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Development

```bash
# Start the development server
npm run dev

# Run tests
npm run test          # Unit tests
npm run test:e2e      # E2E tests
npm run test:all      # All tests

# Type checking
npm run typecheck

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to Cloudflare Workers
npm run deploy
```

## Project Structure

```
src/
├── client/           # React frontend
│   ├── components/   # UI components
│   ├── pages/        # Page components
│   ├── hooks/        # Custom React hooks
│   └── lib/          # Utilities and auth client
├── server/           # Hono backend
│   ├── routes/       # API endpoints
│   ├── services/     # Business logic
│   ├── middleware/   # Auth middleware
│   └── db/           # In-memory database
└── shared/           # Shared types and schemas
    ├── types.ts      # TypeScript types
    └── schemas.ts    # Zod validation schemas
```

## API Endpoints

- `GET /api/buildings` - List all buildings
- `POST /api/buildings` - Create a building
- `GET /api/tenants` - List all tenants
- `POST /api/tenants` - Create a tenant
- `GET /api/invoices` - List all invoices
- `POST /api/invoices` - Create an invoice
- `POST /api/invoices/:id/generate-pdf` - Generate PDF
- `GET /api/invoices/:id/pdf` - Download PDF

## License

MIT