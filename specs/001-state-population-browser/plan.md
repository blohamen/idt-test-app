# Implementation Plan: State Population Browser

**Branch**: `001-state-population-browser` | **Date**: 2026-11-05 | **Spec**: [specs/001-state-population-browser/spec.md](file:///Users/ilya/Projects/idt-test-app/specs/001-state-population-browser/spec.md)

**Input**: Feature specification from `specs/001-state-population-browser/spec.md` with ratified principles from `.specify/memory/constitution.md`.

---

## 1. Summary

The State Population Browser provides a dual-list interactive browser of US states, individual county demographics, and an automated population consistency check. The technical solution implements a containerized TypeScript stack:
- **Backend**: Node.js + Express + TypeScript with raw SQL (`pg` driver) for direct, deterministic PostgreSQL queries; REST APIs mounted directly under root `/` (`/states`, `/state/:name`, `/health`) as specified in the assignment; centralized NestJS-style `HttpException` error handling with `asyncHandler`; structured `Logger`; and graceful process termination.
- **Frontend**: React + TypeScript + Vite with CSS Modules for scoped, lightweight styling without external UI frameworks.
- **Database & Seeding**: PostgreSQL 16 schema with `states` and `counties` tables, initialized via explicit DDL and populated via a standalone seeding script (`npm run db:seed`) importing the 51 states and 3,143 counties from `mock/` with `/state/:name` detail links.
- **Infrastructure**: Streamlined 2-service Docker Compose setup (`db`, `backend`) where Express serves both API REST endpoints and compiled React SPA static assets from a single port (3000), eliminating the separate Nginx container per Principle I (Scope-Appropriate Simplicity).

---

## 2. Technical Context

- **Language / Runtime**: TypeScript 5.x, Node.js 20+ LTS
- **Backend Framework**: Express 4.x with lightweight `HttpException` hierarchy (`BadRequestException`, `NotFoundException`, `InternalServerErrorException`, `ServiceUnavailableException`) and `asyncHandler` wrapper
- **Logging & Lifecycle**: Structured contextual `Logger` (ISO timestamps, levels, JSON in production); Graceful termination handling `SIGTERM`/`SIGINT` closing HTTP and PostgreSQL pools
- **Frontend Framework**: React 18+ with Vite
- **Database / Driver**: PostgreSQL 16, `pg` (node-postgres)
- **Styling**: CSS Modules (`.module.css`)
- **Testing**:
  - Backend: Vitest with Supertest for API contract (`/states`, `/state/:name`, `/health`), seed verification, logger, and exception hierarchy.
  - Frontend: Vitest + React Testing Library for dual-list synchronization, search filtering, and discrepancy display.
- **Containerization**: Docker & Docker Compose v2
- **Constraints**:
  - Raw mock data preserved exactly as-is; Iowa discrepancy (+1 difference between 3,090,416 county sum and 3,090,415 state total) explicitly highlighted in UI.
  - State highlighting is transient in-memory state (React state/context) for the active session.
  - Three-column layout on desktop: List 1 | Search Box + List 2 | Detail Panel.
  - State list containers must be physically constrained to require vertical scrolling for 51 states.
  - Explicit standalone seed command (`npm run db:seed`).


---

## 3. Constitution Check

*Gate: Compliance verification against `.specify/memory/constitution.md`*

| Principle | Check Status | How Plan Complies |
|---|---|---|
| **I. Scope-Appropriate Simplicity** | **PASS** | No heavyweight ORMs (Prisma/TypeORM) or global state libraries (Redux/Zustand). Native `pg`, React built-in hooks, CSS Modules. |
| **II. Explicit Specifications & Criteria** | **PASS** | Single-click vs double-click resolution, 3-column layout, placeholder state, and `/state/:name` contract are explicitly specified in `spec.md`. |
| **III. Source Data Integrity** | **PASS** | 51 state files and `USA-states.json` imported without mutation; Iowa +1 discrepancy preserved in DB and highlighted in UI. |
| **IV. Pragmatic Verification** | **PASS** | Automated integration tests cover the seed pipeline (51 states, 3143 counties count), API endpoints, and critical UI interactions without rigid 100% TDD mandates. |
| **V. Reproducible Environment** | **PASS** | Clean `docker-compose.yml` configures Postgres, backend, and frontend. Step-by-step setup documented from clean clone. |
| **VI. Engineered AI Collaboration** | **PASS** | Engineering decisions and trade-offs verified with user; AI contributions documented in README/notes. |

---

## 4. Project Structure

### Documentation & Spec Kit Artifacts
```text
specs/001-state-population-browser/
├── spec.md                  # Ratified specification
├── plan.md                  # This implementation plan
├── data-model.md            # Relational database schema & types
├── quickstart.md            # Clean-clone run & seed guide
└── contracts/
    └── states-api.yaml      # OpenAPI 3.0 specification for REST endpoints
```

### Source Code Layout
```text
idt-test-app/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts             # Pool configuration & connection helper
│   │   ├── db/
│   │   │   ├── schema.sql        # DDL for states and counties tables
│   │   │   ├── migrate.ts        # Schema migration runner
│   │   │   └── seed.ts           # Standalone seed script reading mock/
│   │   ├── controllers/
│   │   │   └── statesController.ts # Handler for /states and /state/:name
│   │   ├── errors/
│   │   │   └── httpExceptions.ts # Lightweight NestJS-style HttpException hierarchy
│   │   ├── middleware/
│   │   │   └── errorHandler.ts   # Centralized error handler & notFoundHandler
│   │   ├── models/

│   │   │   └── statesRepository.ts # SQL queries for states & counties
│   │   ├── routes/
│   │   │   └── statesRoutes.ts   # Express route definitions
│   │   ├── utils/
│   │   │   ├── logger.ts         # Structured contextual logging
│   │   │   ├── shutdown.ts       # Graceful process shutdown lifecycle
│   │   │   └── asyncHandler.ts   # Async route handler wrapper for Express 4
│   │   ├── app.ts                # Express app setup (CORS, JSON, root API routes, SPA fallback, central error handler)
│   │   └── server.ts             # Server entrypoint with signal handlers & shutdown integration
│   ├── tests/
│   │   ├── seed.test.ts          # Validates 51 states and 3143 counties count
│   │   ├── statesApi.test.ts     # Supertest for /states, /state/:name, health endpoints
│   │   ├── loggerAndShutdown.test.ts # Tests for Logger formatting and graceful termination
│   │   └── httpExceptions.test.ts # Tests for HttpException hierarchy & asyncHandler

│   ├── Dockerfile            # Unified multi-stage build (builds frontend & Express runtime)
│   ├── tsconfig.json
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── statesApi.ts      # Fetch client for /states and state.detail
│   │   ├── components/
│   │   │   ├── StateList/
│   │   │   │   ├── StateList.tsx
│   │   │   │   └── StateList.module.css
│   │   │   ├── StateItem/
│   │   │   │   ├── StateItem.tsx
│   │   │   │   └── StateItem.module.css
│   │   │   ├── SearchBox/
│   │   │   │   ├── SearchBox.tsx
│   │   │   │   └── SearchBox.module.css
│   │   │   ├── DetailPanel/
│   │   │   │   ├── DetailPanel.tsx
│   │   │   │   └── DetailPanel.module.css
│   │   │   └── CountyList/
│   │   │       ├── CountyList.tsx
│   │   │       └── CountyList.module.css
│   │   ├── types/
│   │   │   └── index.ts          # State, County, PopulationSummary interfaces
│   │   ├── App.tsx               # Root component orchestrating 3 columns
│   │   ├── App.module.css        # Layout styles (3 columns, responsive)
│   │   └── main.tsx              # React DOM entrypoint
│   ├── tests/
│   │   ├── StateList.test.tsx    # Double-click sync and single-click select
│   │   ├── SearchBox.test.tsx    # List #2 substring filtering
│   │   └── DetailPanel.test.tsx  # Discrepancy calculation & warning indicator
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── package.json
│
├── mock/                         # Untouched original mock data
│   ├── states/*.json             # 51 county detail files
│   └── usa-states/USA-states.json
├── docker-compose.yml            # 2-service container orchestration (db + backend)
├── .gitignore
└── package.json                  # Root convenience scripts (npm run dev, etc.)
```

---

## 5. Architectural & Design Decisions

### 5.1 Database Schema (`backend/src/db/schema.sql`)
```sql
CREATE TABLE IF NOT EXISTS states (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    population INT NOT NULL,
    county_count INT NOT NULL,
    detail_url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS counties (
    id SERIAL PRIMARY KEY,
    state_id INT NOT NULL REFERENCES states(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    population INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_counties_state_id ON counties(state_id);
```

### 5.2 Seeding Pipeline (`backend/src/db/seed.ts`)
- Explicit standalone execution: `npm run db:seed`.
- Reads `mock/usa-states/USA-states.json`.
- In a single SQL transaction:
  1. Truncates `counties` and `states` (with `CASCADE`).
  2. Inserts all 51 states. For each state, sets `detail_url` to `/state/${encodeURIComponent(state.name)}`.
  3. Reads corresponding `mock/states/<StateName>.json` file.
  4. Inserts all associated counties referencing the generated `state_id`.
- Post-seed assertion: validates that exactly 51 states and 3,143 counties are in the database.

### 5.3 Backend API Endpoints
1. `GET /states`:
   - Returns status `200` with array of state objects:
     ```json
     [
       {
         "id": 1,
         "state": "Alabama",
         "population": 4833722,
         "counties": 67,
         "detail": "/state/Alabama"
       }
     ]
     ```
2. `GET /state/:name`:
   - Decodes state name parameter (e.g. `New%20York` -> `New York`).
   - Retrieves state record and its counties ordered by name.
   - Returns status `200` with county array:
     ```json
     [
       {
         "county": "Autauga County",
         "population": 55246
       }
     ]
     ```
   - If state not found, returns `404` with `{ "error": "State not found" }`.
3. `GET /health`:
   - Healthcheck endpoint returning `{ "status": "ok", "db": "connected" }`.

### 5.4 Frontend Architecture & Interaction Model
1. **State Management**:
   - `states`: `State[]` — loaded once on mount from `GET /states`.
   - `highlightedStateNames`: `Set<string>` — set of highlighted state names toggled on double-click from either list.
   - `selectedState`: `State | null` — currently selected state (single-click on either list).
   - `counties`: `County[] | null` — counties for `selectedState`, loaded by requesting `state.detail`.
   - `searchQuery`: `string` — input value filtering List #2.
2. **Interaction Handlers**:
   - `handleStateSelect(state: State)`: Sets `selectedState` and triggers `fetchCounties(state.detail)`.
   - `handleStateToggleHighlight(state: State)`: Toggles `state.name` presence in `highlightedStateNames`. Also sets `selectedState` without lag.
   - `handleSearchChange(query: string)`: Updates `searchQuery`.
3. **Filtering & Derived State**:
   - List #1 displays all `states`.
   - List #2 displays `filteredStates = states.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))`.
   - Detail panel computes:
     - `countySum = counties.reduce((acc, c) => acc + c.population, 0)`
     - `isMatch = countySum === selectedState.population`
     - `diff = countySum - selectedState.population`
     - If `!isMatch`, renders high-visibility warning badge showing exact discrepancy (e.g. `+1 mismatch`).

---

## 6. Implementation Phases

- **Phase 0 (Research & Setup)**:
  - Repository structure creation (`backend/`, `frontend/`, root `package.json`, `docker-compose.yml`).
  - Configuration of TypeScript, linters, and scripts.
- **Phase 1 (Database & API Layer)**:
  - DDL schema and connection pooling.
  - Seeding script with integrity verification (51 states, 3143 counties).
  - Express routes `/states`, `/state/:name`, `/health`.
  - Integration tests for API and seed.
- **Phase 2 (Frontend Layer)**:
  - Vite React setup with CSS Modules.
  - Component tree: `StateList`, `StateItem`, `SearchBox`, `DetailPanel`, `CountyList`.
  - Synchronized selection, double-click highlight, and real-time search.
  - Population summation and discrepancy warning badge.
  - Frontend component tests.
- **Phase 3 (Dockerization & End-to-End Verification)**:
  - Multi-stage Dockerfiles for backend and frontend.
  - Compose configuration with container healthchecks.
  - Verification of clean-clone bootstrapping and manual seed flow.
  - Final documentation on AI usage and verification notes.
