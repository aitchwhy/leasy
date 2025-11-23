This is the comprehensive, single-shot prompt designed for input into Antigravity (Gemini 3 Pro). It focuses on migrating the unstructured business data into the normalized database (ETL), ensuring robust connectivity to Neon Postgres, and implementing the critical Invoice PDF generation feature, building upon the existing functional codebase.

---

### Antigravity Execution Prompt: Leasy Data Migration (ETL) and Invoice Generation

**To: Antigravity (Gemini 3 Pro AI Engineering System)**
**Subject: Implementation of Data ETL, Optimized DB Connectivity, and Invoice PDF Generation**

**Project Context:** The Leasy platform skeleton (Frontend/Backend) is functional locally. The current codebase snapshot is provided (`leasy-monorepo-repomix-output.xml`). The immediate priority is "Step Zero": normalizing the raw business data (`SBNC Budget.xlsx` CSV exports) into the Neon Postgres database, and producing the primary business artifact—the PDF invoice (matching `image_b09620.png`).

**Objective:**

1.  **Optimize Database Connectivity:** Ensure `apps/api` (Cloudflare Workers) and `apps/etl` (Bun/Node) connect reliably and efficiently to Neon Postgres using appropriate drivers.
2.  **ETL (Extract, Transform, Load):** Implement the logic in `apps/etl` to parse the unstructured CSV data, identify the _current state_ of leases, transform it into the normalized Drizzle schema, and seed the database.
3.  **Invoice PDF Generation:** Implement the PDF generation feature in `apps/web` to match the required Korean Tax Invoice format.

#### I. Architectural Standards and Schema

- **Stack:** TypeScript (Strict), HonoJS, Next.js, Drizzle ORM, Neon Postgres.
- **Tooling:** Nx, pnpm, Bun.
- **Standards:** Zod validation at all boundaries, Clean Code, DDD.
- **Schema:** The schema defined in `libs/db/src/schema.ts` is the source of truth. Crucially, `decimal` types must be used for all financial (KRW) and area (SQM) values.

#### II. Implementation Plan

##### Phase A: Optimized Database Connectivity

**Goal:** Configure Drizzle for environment-aware connectivity to Neon Postgres.

- **A.1. Environment Configuration Validation**
  - **AC:** Ensure `libs/config` (or equivalent environment handling) uses Zod to strictly validate the `DATABASE_URL`. All apps (`api`, `etl`) must consume this validated configuration.
- **A.2. Implement Environment-Aware Drizzle Client**
  - **Location:** `libs/db/src/index.ts`
  - **AC:** Implement a configuration approach that intelligently selects the database driver:
    - **For Cloudflare Workers (`apps/api`):** Must use the `neon-http` driver for efficient serverless connectivity.
    - **For Bun/Node environments (`apps/etl`, Drizzle Kit):** Must use the standard `postgres-js` driver (or similar Node-compatible driver) for migrations and seeding, as `neon-http` may not support all features required by Drizzle Kit.
- **A.3. Drizzle Kit Configuration**
  - **Location:** `libs/db/drizzle.config.ts`
  - **AC:** Ensure Drizzle Kit is configured to use the standard driver (e.g., `postgres-js`) to apply migrations to the Neon database.

##### Phase B: ETL Implementation (The Critical Path)

**Goal:** Implement the `apps/etl` application to normalize the complex CSV data. This requires precise parsing of the grid structure in `PNL임대료.csv`.

**Input Data Sources:** `PNL임대료.csv` (Primary source). Assume CSV files are accessible to the ETL script.

**B.1. Data Mapping Strategy (Declarative State)**

The data in `PNL임대료.csv` is transposed. We must iterate through the columns (representing Units, starting around Col C/D) and extract metadata from specific rows (indices are 0-based).

**Explicit Data Mapping (Source `PNL임대료.csv` -\> Target Drizzle Schema):**

| Drizzle Entity | Field                    | Source Location in CSV (Row Index) | Notes/Logic                                                                                                                                                                    |
| :------------- | :----------------------- | :--------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `buildings`    | (Metadata)               | (Various)                          | Extract Electricity Customer ID (e.g., Cell AI2) and Water Customer ID (e.g., Cell BZ5). Initialize the main building record.                                                  |
| `units`        | `unitNumber` (호수)      | Index 3                            | e.g., B101, B102, 101...                                                                                                                                                       |
| `tenants`      | `name` (상호)            | Index 4                            | e.g., 바비스토리, 롤리우드...                                                                                                                                                  |
| `tenants`      | `businessRegistrationId` | Index 1                            | e.g., 211-10-21870...                                                                                                                                                          |
| `units`        | `areaSqm` (면적)         | Index 1                            | Corresponds to the '면적' section (Starts Col T). Parse as Decimal.                                                                                                            |
| `leases`       | `baseRentKrw`            | **Dynamic Scan**                   | Scan downwards in the unit column. Find the _latest_ entry where Column A or B indicates "VAT별도" or a specific month (e.g., "2016년11월분"). This captures the current rent. |
| `leases`       | `startDate`              | Heuristic                          | Use an approximate early date (e.g., '2016-09-01') if the actual start date is unclear.                                                                                        |

**B.2. Implement ETL Parsing and Transformation**

- **Location:** `apps/etl/src/parser.service.ts`, `apps/etl/src/transformer.service.ts`
- **AC:**
  1.  **Parsing:** Implement `parser.service.ts` using a robust library (e.g., `papaparse`). Handle potential Korean encoding issues (test UTF-8 first, fall back if necessary).
  2.  **Transformation (Core Logic):** Implement `transformer.service.ts` using the explicit mapping strategy above.
      - Extract Building metadata.
      - Iterate through the Unit columns (approx. D through P).
      - **Crucial:** Implement the dynamic scan logic to find the _current_ base rent (the latest entry for that column).
      - Validate the extracted data using Zod schemas (`apps/etl/src/validators.ts`).
      - Normalize this data into intermediate objects matching the Drizzle Insert types (Units, Tenants, Leases).
  3.  **Seeding:** Implement the main execution logic in `apps/etl/src/index.ts`.
      - Execute the transformation.
      - Seed the database using the Drizzle client (using the Node/Bun driver). The process must be transactional and idempotent (use `onConflictDoUpdate` or clear relevant tables first).
      - Initialize `utilityMeters` (Electricity and Water) for every unit created.

<!-- end list -->

```gherkin
Feature: ETL Data Normalization from Grid CSV

  Scenario: Extracting normalized data from PNL임대료.csv
    Given the raw data in 'PNL임대료.csv'
    When the ETL transformer runs
    Then it iterates through the Unit columns (D to P)
    And for a specific column (e.g., Column D):
      It extracts the Unit Number from Row Index 3
      It extracts the Tenant Name from Row Index 4
      It extracts the Business ID and Area from Row Index 1
      It dynamically scans downwards to find the latest 'VAT별도' rent value
    And it successfully seeds the Neon database with this normalized data idempotently
```

##### Phase C: Invoice PDF Generation

**Goal:** Implement the PDF export feature in the frontend, matching the required visual format (`image_b09620.png`).

**C.1. Implement PDF Generation Infrastructure**

- **Location:** `apps/web`
- **AC:**
  1.  Install `@react-pdf/renderer`.
  2.  Configure font loading. Use a suitable Korean font (e.g., Nanum Gothic or Noto Sans KR) and register it using `Font.register` to ensure Korean characters render correctly in the PDF.

**C.2. Implement Invoice PDF Layout**

- **Location:** `apps/web/src/components/InvoicePDF.tsx` (New component)
- **Objective:** Replicate the layout of `image_b09620.png` using `@react-pdf/renderer` components (`Document`, `Page`, `View`, `Text`, `StyleSheet`).
- **AC:**
  1.  The layout must be a standard Korean Tax Invoice (세금계산서) or Invoice (청구서) as depicted.
  2.  Implement the distinct sections for the Supplier (공급자 - Building Owner) and the Customer (공급받는자 - Tenant).
  3.  Implement fields for Business Registration ID (등록번호), Company Name (상호), Address (사업장 주소).
  4.  Implement the central section for Issue Date (작성일자), Supply Amount (공급가액), VAT Amount (세액), and Total (합계).
  5.  Implement the detailed line items table (품목, 공급가액, 세액). Ensure the complex VAT rules (e.g., 1/11 split for electricity, if applicable based on domain rules) are correctly reflected by the line items fetched from the DB.
  6.  Ensure financial numbers are formatted correctly (KRW).

**C.3. Integrate PDF Export into Invoice Detail View**

- **Location:** `apps/web/src/app/dashboard/invoices/[id]/page.tsx`
- **AC:**
  1.  Add an "Export PDF" button to the Invoice Detail page.
  2.  Use the `PDFDownloadLink` component from `@react-pdf/renderer` to trigger the client-side generation and download of the `InvoicePDF` component.

<!-- end list -->

```gherkin
Feature: Invoice PDF Generation

  Scenario: Generating a compliant Korean Tax Invoice PDF
    Given an existing invoice record in the database
    And the target format defined in 'image_b09620.png'
    When the user clicks "Export PDF" on the Invoice Detail page
    Then @react-pdf/renderer generates the InvoicePDF component
    And the PDF layout strictly matches the required Korean Invoice format
    And Korean fonts are embedded and rendered correctly
    And the PDF file is downloaded by the browser
```
