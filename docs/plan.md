### Antigravity Project Execution Prompt: Leasy MVP End-to-End Implementation

**To: Antigravity (Gemini 3 Pro AI Engineering System)**
**Subject: Full MVP Implementation of the Leasy Property Management System**

**Project Status:** Phase 1 (Foundations) is complete. The repository snapshot (`repomix-output.xml` context provided) contains the initialized Nx monorepo structure, Drizzle schema definitions (`libs/db`), and foundational configuration.

**Objective:** Implement the remaining phases (2-5) to achieve a fully functional, end-to-end MVP. This includes data ingestion (ETL), backend API implementation, core domain logic (invoice calculation), frontend dashboard, and CI/CD.

#### I. Architectural Mandates and Standards (Strict Enforcement)

All implementations must strictly adhere to the established elite technology stack and standards:

  * **Monorepo:** Nx (Integrated style).
  * **Tooling:** pnpm (Dependency Management), Bun (Execution/Testing).
  * **Stack:** TypeScript (Strict Mode), HonoJS (CF Workers), Next.js 15+/React 19+ (CF Pages), Neon Postgres, Drizzle ORM, Clerk (Authentication).
  * **Validation:** Zod ("Parse, Don't Validate" at all boundaries). Use schemas in `libs/validators`.
  * **Coding Standards:** Clean Code, SOLID principles, DDD structure (logic isolated in `libs/domain`).
  * **Testing:** Comprehensive unit tests (Bun runner) for all logic, especially financial calculations.

#### II. Critical Domain Logic Reminder

Ensure these rules, derived from the documentation (`docs/requirements/*.md`), are implemented precisely:

  * **Electricity VAT Rule:** Electricity charges must be split: **10/11** for the cost (`ELEC_COST`) and **1/11** for the VAT (`ELEC_VAT`).
  * **Standard VAT:** Rent and Management Fees require a standard 10% VAT.
  * **Utility Usage:** Calculated as the delta between the current and previous month's meter readings.

#### III. Implementation Plan: End-to-End MVP

Execute the following phases sequentially, building upon the existing codebase snapshot.

-----

### Phase 2: Data Ingestion (ETL)

**Goal:** Migrate the current state of the business from Excel/CSV (`docs/data/`) into the normalized database.

**T2.1: Implement ETL Data Parsing, Transformation, and Seeding**

  * **Location:** `apps/etl`
  * **Objective:** Parse, validate, transform, and seed the database from raw CSV data.
  * **Acceptance Criteria:**
    1.  Implement a parsing service (`apps/etl/src/parser.service.ts`) to read `PNL임차인.csv` (Tenants/Leases) and `PNL임대료.csv` (Rent/Area context). Handle potential Korean encoding issues.
    2.  Create specific Zod schemas in `apps/etl/src/validators.ts` to validate the raw CSV structure.
    3.  Implement transformation logic (`apps/etl/src/transformer.service.ts`) to map the validated data to the normalized Drizzle entities (`buildings`, `units`, `tenants`, `leases`).
    4.  **Crucial:** The logic must identify the *current* active tenants and their lease terms.
    5.  Implement the main execution script (`apps/etl/src/index.ts`) to orchestrate the process and seed the database using the client from `libs/db`. The script must be idempotent.
    6.  Initialize `utilityMeters` for each unit (one Electricity, one Water).

<!-- end list -->

```gherkin
Feature: ETL Data Migration

  Scenario: Seeding database from raw CSV files
    Given the raw CSV files 'PNL임차인.csv' and 'PNL임대료.csv' in docs/data/
    And the database schema is initialized
    When the ETL application (`apps/etl`) is executed (using Bun)
    Then the application parses and validates the CSV data using Zod
    And the application identifies the current active leases
    And the application transforms the data into the normalized Drizzle schema
    And the application seeds the Neon Postgres database idempotently
```

-----

### Phase 3: Backend Logic and API Implementation

**Goal:** Implement the core business logic, utility processing, and HonoJS API endpoints (`apps/api`).

**T3.1: Authentication and Middleware (Hono & Clerk)**

  * **Location:** `apps/api/src/middleware`
  * **Objective:** Secure the API endpoints.
  * **AC:**
    1.  Integrate Clerk for authentication within the Hono environment.
    2.  Implement Hono middleware to validate incoming JWTs.
    3.  Ensure all endpoints (except `/health`) are protected.

**T3.2: Implement Tenant and Lease Management API**

  * **Location:** `apps/api/src/routes/tenants.ts`, `apps/api/src/routes/leases.ts`
  * **Objective:** Provide CRUD operations for core entities.
  * **AC:**
    1.  Implement GET, POST, PUT endpoints for `Tenants` and `Leases`.
    2.  Use Zod schemas from `libs/validators` for strict request body validation and response serialization.
    3.  Implement domain logic validation in `libs/domain` (e.g., preventing overlapping active leases for a single unit).

**T3.3: Implement Utility Reading Input API**

  * **Location:** `apps/api/src/routes/utilities.ts`
  * **Objective:** Allow the admin to input monthly meter readings.
  * **AC:**
    1.  Implement a bulk POST endpoint `/utilities/readings` that accepts an array of readings ({meterId, readingDate, value}).
    2.  Validate the input using Zod and insert into the `utilityReadings` table.

**T3.4: Enhance Invoice Calculation Engine (Domain Logic)**

  * **Location:** `libs/domain/src/invoice-calculator.service.ts`
  * **Objective:** Expand the calculation engine to handle utility usage and distribution.
  * **AC:**
    1.  Implement logic to calculate utility usage (delta) by comparing current and previous readings.
    2.  Implement the distribution logic: Given a total utility cost (assume fixed rates per unit/kWh for MVP if not specified), calculate the charge per tenant based on their usage.
    3.  **Crucial:** Ensure the **Electricity VAT Rule (1/11 split)** is applied accurately to the distributed electricity charge.
    4.  Write comprehensive unit tests (Bun) for this service.

<!-- end list -->

```gherkin
Feature: Utility Distribution and Invoicing

  Scenario: Calculating electricity charges and applying VAT rules
    Given Tenant A used 500 kWh of electricity
    And the rate is 220 KRW/kWh
    When the invoice calculation engine calculates the costs
    Then Tenant A's total electricity charge is 110,000 KRW
    And this charge is split into:
      - ELEC_COST: 100,000 KRW (10/11)
      - ELEC_VAT: 10,000 KRW (1/11)
```

**T3.5: Implement Invoice Generation Workflow API**

  * **Location:** `apps/api/src/routes/invoices.ts`
  * **Objective:** Trigger and manage the invoicing process.
  * **AC:**
    1.  Implement `POST /invoices/generate` accepting a billing period (YYYY-MM).
    2.  This endpoint fetches active leases and orchestrates the `InvoiceCalculatorService`.
    3.  Generate `invoices` (Status: DRAFT) and `invoiceLineItems` in a single transaction.
    4.  Implement GET `/invoices` (list) and GET `/invoices/:id` (detail).
    5.  Implement `PUT /invoices/:id/status` to update status (e.g., DRAFT to ISSUED).

-----

### Phase 4: Frontend Implementation and Presentation

**Goal:** Build the user interface using Next.js, Tailwind, and Shadcn/UI (`apps/web`).

**T4.1: Frontend Setup, Authentication, and API Client**

  * **Location:** `apps/web/src/lib`, `apps/web/src/app`
  * **Objective:** Initialize the frontend application, secure it, and establish API communication.
  * **AC:**
    1.  Configure Tailwind CSS and Shadcn/UI.
    2.  Integrate ClerkProvider in the Root Layout and protect routes using Clerk middleware.
    3.  Implement an API client utility that communicates securely with the Hono API (including auth tokens).
    4.  Integrate **TanStack Query (React Query)** for data fetching, caching, and state management. Create custom hooks (e.g., `useLeases`, `useInvoices`).

**T4.2: Occupancy Dashboard and Tenant Management**

  * **Location:** `apps/web/src/app/dashboard`, `apps/web/src/app/tenants`
  * **Objective:** Provide an overview of the building status and manage tenants.
  * **AC:**
    1.  Create a dashboard page displaying a list of units, current tenants, base rent, and lease status (Active/Vacant).
    2.  Implement the Tenant Management UI: A list view (Shadcn Table) and forms (React Hook Form + Zod) for adding/editing tenants.

**T4.3: Monthly Utility Input UI**

  * **Location:** `apps/web/src/app/utilities/input`
  * **Objective:** Efficiently input monthly meter readings.
  * **AC:**
    1.  Create a page displaying all utility meters (Unit, Type) and the previous month's reading.
    2.  Implement an efficient editable form/table for rapid input of the current month's readings.
    3.  Use a TanStack Query mutation to submit the data to the `/utilities/readings` API endpoint.

**T4.4: Invoice Management and Generation UI**

  * **Location:** `apps/web/src/app/invoices`
  * **Objective:** Manage the monthly billing workflow.
  * **AC:**
    1.  Implement an Invoice overview page.
    2.  Add a "Generate Monthly Invoices" feature: Select billing period (YYYY-MM) and trigger the `/invoices/generate` API.
    3.  Display a list of generated invoices (Tenant, Amount, Status) with loading states and success/error feedback (Toasts).

**T4.5: Invoice Detail View and PDF Export**

  * **Location:** `apps/web/src/app/invoices/[id]`
  * **Objective:** Display the detailed invoice and allow compliant export.
  * **AC:**
    1.  Implement the Invoice Detail view. The presentation must closely match the Korean Tax Invoice format (reference `docs/images/*.png`).
    2.  Clearly display the breakdown of line items (Rent, ELEC\_COST, ELEC\_VAT, etc.).
    3.  Implement PDF generation using `@react-pdf/renderer` to create a downloadable, printable version of the invoice.

<!-- end list -->

```gherkin
Feature: Invoice Presentation and Export

  Scenario: Reviewing and exporting a compliant invoice
    Given a DRAFT invoice exists for Tenant A
    When the admin navigates to the Invoice Detail page
    Then the invoice details are displayed matching the Korean Tax Invoice format
    And the line items clearly show the VAT separation (including the 1/11 electricity split)
    When the admin clicks "Export PDF"
    Then a PDF version of the invoice is generated via @react-pdf/renderer and downloaded
```

-----

### Phase 5: CI/CD and Finalization

**Goal:** Automate deployment and ensure robustness.

**T5.1: Frontend Polish and Error Handling**

  * **Objective:** Ensure a robust user experience.
  * **AC:**
    1.  Implement loading states (skeletons or spinners) for all data fetching operations.
    2.  Implement comprehensive error handling and user feedback (Toasts/Alerts) for API failures or validation errors.

**T5.2: Configure CI/CD Pipeline (GitHub Actions)**

  * **Location:** `.github/workflows/deploy.yml`
  * **Objective:** Automate the build, test, and deployment process.
  * **AC:**
    1.  Create a GitHub Actions workflow triggered on push to `main`.
    2.  Configure the workflow to use pnpm for installation and Bun for running tests.
    3.  Utilize Nx caching (`nx affected`).
    4.  **Run Database Migrations:** Execute `nx run db:push` (or similar migration command) against the production database securely.
    5.  Deploy `apps/api` using the Wrangler Action.
    6.  Deploy `apps/web` to Cloudflare Pages.

-----

**Execution Request:** Proceed with the implementation of Phases 2 through 5 based on these formalized specifications, starting from the provided codebase snapshot
