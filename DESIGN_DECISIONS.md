# Design Decisions Document

## Overview
This document captures key design decisions made during the implementation of the Leasy invoice generator application and its E2E testing infrastructure.

## Architecture Decisions

### 1. Technology Stack

**Decision**: Hono + Vite + React on Cloudflare Workers

**Rationale**:
- **Hono**: Lightweight, fast web framework optimized for edge computing
- **Vite**: Modern build tool with excellent DX and HMR support
- **React 19**: Latest features including improved SSR and hooks
- **Cloudflare Workers**: Edge-first deployment with global distribution

**Trade-offs**:
- Limited Node.js compatibility (e.g., PDF generation libraries)
- Smaller ecosystem compared to traditional Node.js

### 2. Authentication Strategy

**Decision**: Simplified session-based auth with mock Google OAuth

**Rationale**:
- Quick MVP implementation
- Easy to replace with real OAuth providers
- Session cookies work well with SSR

**Assumptions**:
- Production will use proper OAuth implementation
- Sessions are acceptable (vs JWT tokens)

### 3. Data Persistence

**Decision**: In-memory storage for MVP

**Rationale**:
- Zero infrastructure requirements
- Fast development iteration
- Easy to replace with real database

**Implementation**:
```typescript
// Simple Map-based storage
const sessions = new Map<string, any>()
```

## UI/UX Decisions

### 1. Component Library

**Decision**: shadcn/ui components with Radix UI primitives

**Rationale**:
- Full control over styling
- Accessibility built-in
- Modern, clean aesthetic
- Copy-paste flexibility

**Trade-offs**:
- More initial setup vs pre-built libraries
- Need to maintain component code

### 2. Form Handling

**Decision**: Controlled components with React state

**Rationale**:
- Simple for MVP
- Real-time calculations
- Easy validation

**Future Considerations**:
- Could integrate React Hook Form for complex forms
- TanStack Form for type-safe forms

## Testing Decisions

### 1. E2E Testing Framework

**Decision**: Playwright with TypeScript

**Rationale**:
- Modern, reliable cross-browser testing
- Excellent debugging tools (trace viewer)
- Strong TypeScript support
- Auto-waiting and retry mechanisms

### 2. Test Structure

**Decision**: Page Object Model (POM) pattern

**Rationale**:
- Separates test logic from UI interactions
- Improves maintainability
- Enables reusability
- Industry best practice

**Structure**:
```
tests/
├── pages/          # Page objects
├── fixtures/       # Test data & mocks
├── e2e/           # Test specs
└── setup/         # Configuration
```

### 3. API Mocking Strategy

**Decision**: Mock Service Worker (MSW) for API mocking

**Rationale**:
- Network-level interception
- Same mocks for dev and test
- No application code changes
- Realistic testing conditions

**Implementation Notes**:
- Due to Playwright limitations, using built-in mock auth
- MSW prepared for future integration

### 4. Test Data Management

**Decision**: Centralized test data with TypeScript

**Rationale**:
- Type safety
- Single source of truth
- Easy to maintain
- Consistent across tests

## Code Organization

### 1. Shared Types

**Decision**: Shared types directory for client/server

**Rationale**:
- DRY principle
- Type safety across boundaries
- Zod schemas for runtime validation

### 2. Minimal Abstractions

**Decision**: Start simple, refactor when needed

**Rationale**:
- Avoid over-engineering
- Clear, readable code
- Easy onboarding

## Performance Considerations

### 1. PDF Generation

**Decision**: Placeholder implementation for MVP

**Rationale**:
- React PDF incompatible with Workers
- Allows progress on other features
- Can implement server-side solution later

**Future Options**:
- Separate PDF service
- Server-side rendering
- Third-party PDF API

### 2. State Management

**Decision**: React Query for server state

**Rationale**:
- Built-in caching
- Optimistic updates
- Background refetching
- Minimal boilerplate

## Security Considerations

### 1. Authentication

**Assumptions**:
- HTTPS only in production
- HttpOnly cookies for sessions
- CSRF protection needed
- Rate limiting required

### 2. Input Validation

**Decision**: Zod schemas on client and server

**Rationale**:
- Runtime type checking
- Consistent validation
- Good error messages

## Future Enhancements

### Priority 1
- Real Google OAuth integration
- Persistent database (PostgreSQL/D1)
- PDF generation service
- Email notifications

### Priority 2
- Multi-tenancy support
- Advanced reporting
- Bulk operations
- Mobile app

### Priority 3
- Webhooks/integrations
- Advanced permissions
- Audit logging
- Internationalization

## Lessons Learned

1. **Edge constraints**: Not all Node.js libraries work in Workers
2. **Type safety**: Zod + TypeScript provides excellent DX
3. **Component architecture**: shadcn/ui approach scales well
4. **Testing complexity**: Browser automation requires setup
5. **Mock data**: Centralized test data improves maintainability

## Decision Log

| Date | Decision | Rationale | Impact |
|------|----------|-----------|--------|
| 2024-01 | Use Hono framework | Edge-optimized | High |
| 2024-01 | shadcn/ui components | Flexibility | Medium |
| 2024-01 | In-memory storage | MVP speed | High |
| 2024-01 | Playwright testing | Modern E2E | High |
| 2024-01 | Mock auth for MVP | Development speed | Medium |

---

This document should be updated as new significant decisions are made.