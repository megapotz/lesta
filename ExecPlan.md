# Node + SPA Prototype for Lesta Blogger HUB

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept current as implementation advances. Consult `PLAN.md` in the repository root for historical requirements context; maintain both documents in sync.

## Purpose / Big Picture

We will deliver a demonstrable Lesta Blogger HUB prototype that lets marketing managers and the CMO capture campaigns, bloggers, counterparties, placements, and comments through a browser-based single-page application backed by a Node.js API. After completing this plan, a user can log in, create core entities, review aggregated dashboards, manage placement lifecycles, and export or import placement payment data to coordinate with finance.

## Progress

- [x] (2025-10-17 08:25Z) Drafted the initial ExecPlan after reviewing `LestaHub_TZ.md` and supporting docs.
- [x] (2025-10-17 08:42Z) Initialized workspaces, shared tooling, linting config, and documentation scaffolding.
- [x] (2025-10-17 09:30Z) Implemented backend data model, authentication, CRUD APIs, and import/export utilities.
- [x] (2025-10-17 09:35Z) Added Prisma schema push and seed script with demo records.
- [x] (2025-10-17 10:15Z) Assembled SPA shell with authentication context, layout, and shared query provider.
- [x] (2025-10-17 10:45Z) Built interactive feature pages (dashboard, campaigns, placements, bloggers, counterparties, users) wired to live APIs.
- [ ] Exercise end-to-end flows, capture acceptance evidence, and update docs.

## Surprises & Discoveries

- Observation: `LestaHub_TZ.md` is stored in Windows-1251 encoding; direct `cat` output is unreadable.
  Evidence: Converting with `iconv -f windows-1251 -t utf-8 LestaHub_TZ.md` yields legible Russian text that defines the MVP scope.
- Observation: Local runtime reports Node.js `v18.19.1`, which is below the initially assumed Node 20 baseline.
  Evidence: Running `node -v` returned `v18.19.1`; frontend dependencies were pinned to Vite 5.x and React 18.x to maintain compatibility without engine warnings.
- Observation: React 18 typings surfaced when wiring testing utilities; downgraded testing-library and Zustand to React 18-compatible versions.
  Evidence: `npm ls @types/react` showed v19 transitive dependencies until pinning `@testing-library/react@14.x` and `zustand@4.x`.

## Decision Log

- Decision: Use Node.js 20 with TypeScript, Express, and Prisma over SQLite for the backend prototype.
  Rationale: This stack minimizes setup friction, supports relational modeling for the rich entity graph, and keeps dependencies lightweight without external services.
  Date/Author: 2025-10-17 / Codex

- Decision: Adopt JWT-based stateless authentication with HTTP-only cookies and role checks for `admin` and `manager`.
  Rationale: Matches the two-role requirement, lets the SPA rely on fetch calls without manual token storage, and keeps infrastructure minimal for a prototype.
  Date/Author: 2025-10-17 / Codex

- Decision: Build the SPA with Vite, React, TypeScript, React Router, and TanStack Query, complemented by a minimal design system built from CSS modules.
  Rationale: Vite + React delivers fast DX, React Router aligns with the multi-section navigation in the TЗ, and TanStack Query simplifies cache and loading states for the numerous CRUD APIs.
  Date/Author: 2025-10-17 / Codex

- Decision: Pin the frontend toolchain to React 18.3, Vite 5.4, and `@vitejs/plugin-react` 4.3 to align with the available Node.js 18 runtime.
  Rationale: Adjusting dependency versions eliminates engine incompatibility warnings while still satisfying the SPA requirements outlined in the TЗ.
  Date/Author: 2025-10-17 / Codex

- Decision: Adopt TanStack Query with local form state to orchestrate SPA data fetching and cache invalidation.
  Rationale: Provides cache-aware hooks for CRUD-heavy tables (campaigns, placements, bloggers, counterparties, users) without introducing heavyweight UI kits.
  Date/Author: 2025-10-17 / Codex

## Outcomes & Retrospective

Pending first implementation milestone; update once backend scaffolding is complete and validated.

## Context and Orientation

The repository is currently empty aside from documentation files (`LestaHub_TZ.md`, `PLAN.md`, `lestahub.md`). No runtime code, package manifests, or tooling exist yet. The goal is to create a full-stack prototype with two workspaces: `backend/` for the Node API and `frontend/` for the SPA. The MVP must cover entity management for campaigns, bloggers, counterparties, placements, price presets, comments (including system-generated audit events), and users with admin/manager roles. Non-functional needs such as imports, exports, dashboard aggregations, and overdue placement highlighting are equally important for demonstrating value to the CMO. The system must run locally with SQLite and expose REST endpoints consumed by the SPA.

## Plan of Work

Phase 1 — Scaffolding and Tooling: From the repository root, create a top-level `package.json` configured for npm workspaces (`backend`, `frontend`). Add shared scripts for `npm run backend:*` and `npm run frontend:*`. Extend `.gitignore` to cover both workspaces (`node_modules`, `dist`, `dev.db`, environment files). Add a `README.md` outlining project setup, and configure `.editorconfig` and Prettier if absent to enforce consistent formatting across TypeScript and CSS files.

Phase 2 — Backend Foundation: Inside `backend/`, initialize the project with TypeScript support. Create `package.json`, `tsconfig.json`, `nodemon.json`, and `prisma/schema.prisma`. Install runtime dependencies (`express`, `cors`, `cookie-parser`, `jsonwebtoken`, `bcryptjs`, `multer`, `xlsx`, `zod`, `@prisma/client`) and dev dependencies (`typescript`, `ts-node`, `tsx`, `nodemon`, `prisma`). Add `src/app.ts` to configure the Express application (JSON parsing, cookie handling, CORS, health check), `src/server.ts` to bootstrap the server, and `src/config/env.ts` to centralize environment variables with defaults and validation via `zod`.

Phase 3 — Database Modeling: In `prisma/schema.prisma`, define models for `User`, `Campaign`, `Counterparty`, `Blogger`, `PricePreset`, `Placement`, and `Comment`. Include enums for campaign status, placement status, pricing model, and user roles. Model optional fields for different counterparty types with nullable columns. Capture relationships such as `Placement` referencing campaign, blogger, and counterparty, `Comment` linking to either blogger or counterparty via optional foreign keys, and system metadata (createdAt, updatedAt). Run `npx prisma generate` to verify schema integrity.

Phase 4 — Backend Features: Create route modules under `src/routes/` (e.g., `auth.ts`, `campaigns.ts`, `bloggers.ts`, `counterparties.ts`, `placements.ts`, `pricePresets.ts`, `comments.ts`, `users.ts`). Implement controllers in `src/controllers/` that use Prisma client instances from `src/lib/prisma.ts`. For each entity, implement CRUD operations with input validation via `zod` schemas stored in `src/validation/`. Add middleware for authentication (`src/middleware/auth.ts` verifying JWT cookie) and role authorization. Implement placement status transitions in `src/services/placementService.ts`, ensuring only allowed deletions (`Planned` status) and automatic creation of system comments on status changes. Provide aggregated dashboard data from `src/services/dashboardService.ts`, returning metrics required in the TЗ (budget burn, top bloggers, spend by counterparty type).

Phase 5 — Import/Export and Utilities: Under `src/routes/placements.ts`, add endpoints for `GET /api/placements/export` (returning CSV generated via `xlsx` package) and `POST /api/placements/import` (accepting multipart uploads through `multer`, reading CSV/XLSX, updating statuses, and summarizing results). Ensure import logic resides in `src/services/importService.ts` with explicit error handling and idempotence checks. Implement a comment feed aggregator for counterparties to include comments from linked bloggers. Extend the logger by appending system comments in `src/services/commentService.ts` during entity creation and updates.

Phase 6 — Backend Testing and Seeds: Add `src/seed.ts` to populate the database with sample users (one admin, one manager), campaigns, counterparties, bloggers, placements, and comments. Provide `npm run seed` script that calls `prisma db push` followed by seed execution. Introduce minimal integration tests using `vitest` and `supertest` under `tests/` to cover auth flow, campaign CRUD, and placement status rules. Configure `vitest` in `tsconfig.json` and add `npm run test` script.

Phase 7 — Frontend Foundation: Scaffold `frontend/` via `npm create vite@latest frontend -- --template react-ts`. Configure `tsconfig.json`, `vite.config.ts`, and `.eslintrc.cjs` for aliasing (`@/`) and linting. Install dependencies (`react-router-dom`, `@tanstack/react-query`, `zustand`, `clsx`, `date-fns`) and dev tools (`eslint`, `prettier`, `typescript`, `vitest`, `@testing-library/react`). Establish layout components (`src/layouts/AppLayout.tsx`, `src/components/Sidebar.tsx`, `src/components/Header.tsx`), a shared `src/api/client.ts` with fetch wrapper using credentials for cookies, and an `AuthProvider` context to store user data.

Phase 8 — SPA Features: Implement route pages under `src/pages/` for `Login`, `Dashboard`, `Campaigns/List`, `Campaigns/Detail`, `Placements/List`, `Bloggers/List`, `Counterparties/List`, and `Users/List`. Use TanStack Query hooks in `src/api/queries/` to fetch data, derived selectors for filters, and mutation hooks for create/update/delete. Provide forms as controlled components in `src/components/forms/`, leveraging dialog modals for create/edit actions. Implement conditional styling in placements table to highlight overdue items (rows with status `AwaitingPublication` past `placementDate` or status `Overdue`). Support CSV export by invoking the backend endpoint and triggering a blob download, and import by posting `FormData` from a file input. Ensure cross-linking between entities via `<Link>` components.

Phase 9 — Finishing Touches: Add loading and empty states, toast notifications for success/errors (custom hook in `src/hooks/useToast.tsx`), and basic responsive styling via CSS modules stored in `src/styles/`. Document environment variables in `frontend/.env.example` (e.g., `VITE_API_BASE_URL`). Update root `README.md` with step-by-step setup for both backend and frontend, including seeding instructions and credential hints.

## Concrete Steps

From the repository root, ensure Node.js 20+ and npm 10+ are available:

    node -v
    npm -v

Initialize workspaces and shared config:

    npm init -y
    npm pkg set "name" "lestahub"
    npm pkg set "private" true
    npm pkg set "workspaces[0]" "backend"
    npm pkg set "workspaces[1]" "frontend"

Backend setup commands (run from repository root unless specified):

    mkdir backend
    cd backend && npm init -y
    npm install express cors cookie-parser jsonwebtoken bcryptjs multer xlsx zod @prisma/client
    npm install -D typescript ts-node tsx nodemon prisma vitest supertest @types/express @types/cookie-parser @types/jsonwebtoken @types/bcryptjs @types/multer
    npx tsc --init
    npx prisma init --datasource-provider sqlite

Generate Prisma client whenever `schema.prisma` changes:

    npx prisma generate

Run migrations/DB push and seeds:

    npx prisma db push
    npm run seed

Start the backend in development with hot reload:

    npm run dev

Frontend setup:

    npm create vite@latest frontend -- --template react-ts
    cd frontend && npm install
    npm install react-router-dom @tanstack/react-query zustand clsx date-fns
    npm install -D eslint prettier vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event

Start the SPA in development mode:

    npm run dev -- --host

Use `npm run test` inside each workspace to execute backend (`vitest --run`) and frontend (`vitest run --environment jsdom`) tests respectively. The root `npm run dev` script should launch both servers via `npm-run-all` or `concurrently` if added.

## Validation and Acceptance

1. Run `npm install` at the root to install workspace dependencies, then execute `npm run seed --workspace backend` to generate demo data. Verify the command reports seeded users and entities without errors.
2. Start both services (`npm run dev --workspace backend` and `npm run dev --workspace frontend`). Navigate to `http://localhost:5173`, log in using the seeded admin credentials (documented in backend seed script). Confirm you are redirected to the dashboard showing campaign totals, spend-to-budget progress, and top bloggers.
3. Create a new campaign, blogger, counterparty, and placement through the SPA forms. Confirm each appears immediately in its respective list and that placement creation logs a system comment visible in the placement history.
4. Change a placement status to `AwaitingPublication`, adjust its date to the past, and verify the row is highlighted. Update the status to `Overdue` and observe the distinct styling.
5. Use the export button on the placements screen to download a CSV; open the file to see columns for counterparty name, tax id, amount, and campaign. Modify the CSV to simulate payment confirmation, upload through the import dialog, and confirm the summary toast and updated statuses.
6. As admin, view the users list, invite a new user (placeholder record), and deactivate/reactivate an existing user to ensure role-based screens function. Attempt to access the users screen as a manager to confirm access is denied.

Acceptance criteria are met when all flows above succeed without backend errors, persisted data reflects changes in SQLite, and the SPA demonstrates the dashboards and entity management behaviors described in the TЗ.

## Idempotence and Recovery

Backend migrations and seeds can be rerun safely via `npx prisma migrate reset --force`, which clears and repopulates the SQLite database. File-based imports ignore duplicate placement IDs and leave unaffected rows untouched. If the SPA or API crashes, restart using the dev scripts; hot reload retains state. Uploaded CSV/XLSX files are processed in-memory and never stored on disk. To reset auth state, clear browser cookies for `localhost`.

## Artifacts and Notes

Capture screenshots or CLI transcripts once core flows are verified: seeding output, API server startup, dashboard view, placement export/import confirmation, and highlighted overdue placements. Store short summaries in this section during implementation updates.

## Interfaces and Dependencies

External dependencies include Node.js 20+, npm 10+, SQLite (bundled through Prisma), and Vite dev server. Backend exposes REST endpoints under `/api`:

- `POST /api/auth/login` → authenticates by email/password, sets `access_token` HTTP-only cookie.
- `POST /api/auth/logout` → clears cookie.
- `GET /api/auth/me` → returns current user profile and role.
- `GET/POST/PATCH /api/campaigns` and `GET /api/campaigns/:id` → manage campaigns with fields (name, product, goal, type, budget, status, startDate, endDate, managerIds, alanbaseSub2).
- `GET/POST/PATCH /api/bloggers` → manage bloggers with uniqueness on `profileUrl`, optional `counterpartyId`, contact and reach metrics.
- `GET/POST/PATCH /api/counterparties` → manage counterparties with type-specific tax fields, soft-delete flag, and `paymentDetails`.
- `GET/POST/PATCH/DELETE /api/price-presets` → CRUD presets tied to bloggers.
- `GET/POST/PATCH/DELETE /api/placements` → manage placements linking campaigns, bloggers, counterparties, pricing model, fee, timeline, performance metrics, status transitions, and screenshot URL.
- `GET/POST /api/comments` → read/write comments for bloggers or counterparties; system comments are read-only and flagged by `isSystem`.
- `GET /api/dashboard` → aggregated metrics for spend, performance, top bloggers, and spend by counterparty type.
- `GET /api/placements/export?status=` → CSV export for finance.
- `POST /api/placements/import` → multipart upload for CSV/XLSX, updates statuses from `AwaitingPayment` to `AwaitingPublication`.
- `GET/POST/PATCH /api/users` → admin-only user management (create invites, toggle activation, role assignment).

SPA depends on these endpoints and runs against `VITE_API_BASE_URL` (default `http://localhost:4000`). Use TanStack Query hooks to call endpoints with `credentials: 'include'`. Authentication context must redirect unauthenticated users to `/login`.

---
Note (2025-10-17 / Codex): Initial ExecPlan drafted to guide end-to-end prototype implementation.
Note (2025-10-17 / Codex): Updated progress and dependency choices after scaffolding under Node.js 18.
Note (2025-10-17 / Codex): Backend CRUD, seed workflow, and React SPA feature pages landed; moving to validation.
