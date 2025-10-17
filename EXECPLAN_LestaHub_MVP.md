# ExecPlan: Lesta Blogger HUB (MVP)

Purpose: Implement a minimal but working web application where a React SPA (Vite + TypeScript) talks to a FastAPI REST backend (SQLite). Marketing managers and admins manage campaigns, bloggers, counterparties, and placements, track statuses, and export a prepayment registry. The CMO can open a dashboard to see basic KPIs. This plan is self-contained: follow it end-to-end to run the MVP locally.

## Scope Overview

We will build a FastAPI + SQLite application that exposes a REST API, and a separate React frontend using Vite + TypeScript. SQLite avoids external services; React provides better UX for multi-screen lists, filters, and status highlights. Authentication can start simple (placeholder) and evolve. Data integrity rules from LestaHub_TZ.md are enforced in model-level validators and service functions. Export to `.xlsx` uses `openpyxl`.

Core entities: User, Counterparty, Blogger, Campaign, Placement, Comment, PricePreset, plus reference enums for statuses and dropdowns. MVP covers CRUD + key workflows:
- Create and list Campaigns; add Placements; see placement table with overdue highlight.
- Create and list Bloggers and Counterparties; link Blogger↔Counterparty many-to-many.
- Placement lifecycle statuses and validations per spec; generate prepayment registry `.xlsx`.
- Dashboard: overall spend, publications count, average CPV, average ER; simple active-campaign progress indicator.
- Admin-only user management.

Non-goals for MVP: external analytics integrations, advanced auth flows, full-blown reporting. Initial SPA views use mock data first, then replace with API calls.

## Environment and Dependencies

Assumptions: Python 3.11+, Node 18+, no external DB. Network access may be required to install packages.

Create venv and install dependencies:

    python -m venv .venv
    source .venv/bin/activate    # Windows PowerShell: .venv\\Scripts\\Activate.ps1
    pip install fastapi uvicorn[standard] sqlalchemy passlib[bcrypt] python-multipart openpyxl

Frontend setup (later step):

    npm create vite@latest web -- --template react-ts
    cd web
    npm install
    npm run dev

Project layout (created by this plan):

    app/
      main.py
      database.py
      models.py
      enums.py
      auth.py
      services.py
      deps.py
      routers/
        __init__.py
        web.py
        campaigns.py
        bloggers.py
        counterparties.py
        placements.py
        users.py
    web/
      index.html
      src/
        main.tsx
        App.tsx
        pages/ (Dashboard, Campaigns, Bloggers, Counterparties, Placements, Users)
        components/ (Table, Filters, ProgressBar)

## Data Model

Use SQLAlchemy ORM with SQLite. Define tables matching LestaHub_TZ.md fields. Key choices:
- User: id, name, email (unique), role (enum: ADMIN, MANAGER), password_hash, status (ACTIVE, INVITED, DEACTIVATED).
- Counterparty: id, name, type (SELF_EMPLOYED, IE, LEGAL), inn, relationship_type (DIRECT, AGENCY, CPA_NETWORK), payment_details (text), contacts (json-string), notes.
- Blogger: id, name, url (unique), network (enum), subscribers, avg_reach, main_contact_type, main_contact, counterparties many-to-many via association table, er_cached (optional).
- Campaign: id, name, product (enum), goal_type (AWARENESS, PERFORMANCE), budget, status (PLANNED, ACTIVE, COMPLETED), start_date, end_date.
- Placement: id, campaign_id, blogger_id, counterparty_id, created_by_user_id, placement_date, fee, link, screenshot_url, views, likes, comments, shares, er, status (as spec), payment_terms (PREPAID, POSTPAID, PARTIAL), placement_type, pricing_model, erid_token, alanbase_sub1, tracking_link.
- Comment: id, user_id, created_at, text, blogger_id nullable, counterparty_id nullable.
- PricePreset: id, blogger_id, title, description, price.

Implement validators:
- Unique Blogger.url.
- Placement status transition rules and required fields per 5.5.1 and 5.5.3.
- Auto mark "Просрочено" if placement_date < today and status not "Опубликовано".

## UI and Endpoints

REST API (FastAPI):
- /api/dashboard (GET): KPIs and active campaigns progress summary.
- /api/campaigns (GET/POST), /api/campaigns/{id} (GET/PATCH).
- /api/bloggers (GET/POST), /api/bloggers/{id} (GET/PATCH).
- /api/counterparties (GET/POST), /api/counterparties/{id} (GET/PATCH).
- /api/placements (GET/POST), /api/placements/{id} (GET/PATCH).
- /api/placements/export/prepayments (GET): xlsx file.
- /api/users (admin) (GET/POST/PATCH minimal for MVP).

Auth placeholder: simple header or cookie stub (no full JWT/session yet) to unblock UI; evolve later.

## Milestones

1) Bootstrap project
- Create app structure, database connection, and enums.
- Seed reference dropdowns in enums.py (hardcoded).
- Implement create_all DB init and a CLI seed for an admin user.
- Add CORS for http://localhost:5173.
- Acceptance: run server and hit /api/health.

2) Data models + validations
- Implement SQLAlchemy models and relationships; business rules in services.py.
- Acceptance: create and query sample data via minimal forms.

3) Core API: Campaigns and Placements
- List/create Campaigns; Campaign detail with placements; add placement; overdue highlighting computed server-side.
- Acceptance: create entities via API; verify responses and overdue flags.

4) Bloggers and Counterparties API
- List/create/edit Bloggers and Counterparties; many-to-many linking in Blogger form.
- Acceptance: add blogger and link to counterparty; verify via API.

5) Dashboard API
- Compute spend, publications, CPV, average ER; active-campaign progress data with color logic.
- Acceptance: GET /api/dashboard returns expected numbers.

6) Export prepayment registry
- Filter placements with status "Ожидает оплаты"; generate .xlsx using openpyxl; download.
- Acceptance: open file and see expected columns.

7) Users (Admin) API
- List users; create invite (stores INVITED with token); activate/deactivate; simple login placeholder.
- Acceptance: manage users via API.

8) SPA scaffolding and mocks
- Scaffold Vite React app; pages and routing; components for tables and filters.
- Use mock data to implement UX per spec: lists with sorting, filters, overdue highlight, progress bar visuals.
- Acceptance: `npm run dev` shows navigable pages with mock content.

9) Hook SPA to API
- Replace mocks with real fetches; handle basic loading and errors.
- Acceptance: UI shows live data from FastAPI.

## Run and Verify

Initialize and run:

    python -m venv .venv
    source .venv/bin/activate    # Windows: .venv\\Scripts\\Activate.ps1
    pip install -r requirements.txt  # optional if we add one
    uvicorn app.main:app --reload

In another terminal:

    cd web
    npm run dev

Open http://localhost:5173 for the SPA. The SPA calls http://localhost:8000/api/*.

## Progress

- [ ] 1) Bootstrap
- [ ] 2) Models + validations
- [ ] 3) Campaigns + Placements pages
- [ ] 4) Bloggers + Counterparties
- [ ] 5) Dashboard
- [ ] 6) Export .xlsx
- [ ] 7) Users

## Decision Log
- 2025-10-16: Chose FastAPI + Jinja2 + SQLite for speed and zero external services.
- 2025-10-16: Implemented server-rendered pages first to ensure usability without a SPA.

## Notes

If package install is unavailable, you can still review the code and data model. Export can fall back to CSV; swap to xlsx when `openpyxl` is available.
