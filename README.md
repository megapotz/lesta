# Lesta Blogger HUB Prototype

This repository contains a Node.js + React single-page application prototype for the Lesta Blogger HUB MVP. It follows the requirements in `LestaHub_TZ.md` and is organized as a multi-workspace project with separate packages for the backend API and the frontend SPA.

## Prerequisites

- Node.js 18.19+ (Node 20 is recommended for long-term compatibility).
- npm 9+.

## Getting Started

1. Install dependencies:

       npm install

2. Start the development servers (API on port 4000, SPA on port 5173):

       npm run dev

3. The backend uses SQLite via Prisma. To set up the database with demo data, run:

       npm run seed

   You can rerun seeding safely; it will reset the database contents.

   Demo credentials after seeding:

   - Admin: `admin@lestahub.local` / `admin123`
   - Manager: `manager@lestahub.local` / `manager123`

4. To execute tests for both workspaces:

       npm test

## Project Structure

- `backend/` – Express + Prisma API with authentication, CRUD endpoints, import/export utilities, and audit logging.
- `frontend/` – React SPA (Vite) with React Router, TanStack Query, and Zustand for state management.

## Environment Variables

- `backend/.env.example` – template for backend configuration. Copy to `backend/.env` and adjust as needed.
- `frontend/.env.example` – template for frontend configuration. Copy to `frontend/.env` and set `VITE_API_BASE_URL`.

## Scripts

- `npm run backend:dev` – Start the backend in development mode (hot reload).
- `npm run backend:test` – Run backend tests.
- `npm run backend:seed` – Apply schema and load demo data.
- `npm run frontend:dev` – Start the SPA dev server.
- `npm run frontend:test` – Run frontend tests (jsdom).
- `npm run dev` – Run backend and frontend together.
- `npm run build` – Build both workspaces.

Refer to `ExecPlan.md` for the execution plan that drives the implementation.
