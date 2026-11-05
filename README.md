# US State Population Browser (NRS Fullstack Test Task)

A fullstack web application for exploring demographic data across all 51 US states and 3,143 counties, verifying population totals against individual county sums, and interacting with synchronized, searchable state lists.

Developed as a test assignment for **IDT**, following the **Spec Kit** methodology (Constitution → Specify → Clarify → Plan → Tasks → Implement).

---

## Features

1. **Dual Synchronized State Lists**:
   - Two vertically scrollable state lists constrained to require scrolling for 51 states.
   - **Single-Click**: Selects a state and displays its demographic details in the Detail Panel.
   - **Double-Click**: Toggles highlighted/unhighlighted status across both lists in real time.
2. **Real-Time Filtering (List #2 Only)**:
   - Case-insensitive substring search (e.g. typing `"ne"` matches Maine, Nevada, Nebraska, Minnesota).
   - Applied exclusively to List #2 while List #1 remains completely unfiltered.
   - Preserves highlighted status on filtered items.
3. **County Demographic Breakdown & Integrity Check**:
   - Displays state name, recorded total population, recorded county count, loaded counties count, and calculated sum of county populations.
   - **Integrity Validation**: Evaluates whether the sum of county populations matches the recorded state total.
   - **Discrepancy Highlighting**: Preserves and explicitly flags data anomalies (such as Iowa's `+1` discrepancy) with a high-visibility badge.
4. **Relational PostgreSQL Persistence**:
   - Structured schema with `states` and `counties` tables and foreign key constraints.
   - Deterministic, transactional seeding script importing raw mock JSON data without alteration.

---

## Architecture & Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Frontend** | React 18, TypeScript, Vite, CSS Modules | High performance, strict type safety, zero external UI framework overhead. |
| **Backend & Static Host** | Node.js 20+, Express, TypeScript, `pg` | Lightweight REST API and static asset hosting, native parameterized SQL queries without heavy ORM bloat. |
| **Database** | PostgreSQL 16 (Alpine) | Standard relational storage with foreign keys and cascade rules. |
| **Testing** | Vitest, React Testing Library, Supertest | Fast unit and integration tests covering database seed, API contracts, and UI sync. |
| **Containerization** | Docker, Docker Compose v2 | Streamlined 2-service setup (`db`, `app`) on a unified port (3000) for reproducible clean-clone execution. |

---

## Quickstart (Docker - Recommended)

### Prerequisites
- Docker & Docker Compose v2+ installed and running.

### 1. Clone & Start Containers
```bash
git clone <repository-url>
cd idt-test-app

# Build and start PostgreSQL and the Unified Application
docker compose up --build -d
```

### 2. Populate Database from Mock Data
Run the standalone database seed command:
```bash
docker compose exec app npm run db:seed
```
*Output confirmation:*
```text
[migrate] Applying schema from /app/src/db/schema.sql
[migrate] Schema applied successfully.
[seed] Using mock directory: /app/mock
[seed] Clearing existing data...
[seed] Seed completed successfully: 51 states, 3143 counties inserted.
```

### 3. Access the Application
- **Web UI & REST API**: [http://localhost:3000](http://localhost:3000)
- **Backend API (`/states`)**: [http://localhost:3000/states](http://localhost:3000/states)
- **Healthcheck**: [http://localhost:3000/health](http://localhost:3000/health)

To stop the containers:
```bash
docker compose down
```

---

## Running Locally (Without Docker)

### Prerequisites
- Node.js `v20.x` or later
- Running PostgreSQL instance (default credentials: `postgres:postgrespassword@localhost:5432/states_db`)

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Configure Environment (Optional)
Create `backend/.env` if your database credentials differ:
```env
PORT=5001
DATABASE_URL=postgres://postgres:postgrespassword@localhost:5432/states_db
```

### 3. Run Migrations & Seeding
```bash
npm run db:migrate
npm run db:seed
```

### 4. Start Development Servers
```bash
# In terminal 1 (Backend):
npm run dev:backend

# In terminal 2 (Frontend):
npm run dev:frontend
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Automated Verification & Testing

Both frontend and backend suites can be run with a single command from the root directory:

```bash
# Run all backend and frontend tests
npm test
```

### Backend Tests (`backend/tests/`)
- `seed.test.ts`: Verifies exact count of 51 states, 3,143 counties, Texas (254 counties), and asserts the Iowa +1 discrepancy.
- `statesApi.test.ts`: Supertest suite verifying `GET /health`, `GET /states`, `GET /state/:name` (including decoded spaces like `New%20York`), and 404 handling.

### Frontend Tests (`frontend/tests/`)
- `DetailPanel.test.tsx`: Tests placeholder initial state, matching indicator, and Iowa +1 mismatch badge.
- `DualListSync.test.tsx`: Tests double-click synchronization across both lists and single-click detail selection from List #2.
- `SearchBox.test.tsx`: Tests real-time substring filtering on List #2, ensuring List #1 remains completely untouched.

---

## Source Data & Demographic Anomaly Note

The raw mock data is located in `mock/`:
- `mock/usa-states/USA-states.json`: List of 51 states (including District of Columbia).
- `mock/states/*.json`: 51 individual files detailing counties for each state.

**Iowa Demographic Discrepancy**:
- State recorded population: `3,090,415`
- Sum of individual 99 counties: `3,090,416`
- Difference: `+1`

Per **Principle III** of the project constitution, this anomaly was intentionally **preserved in storage and surfaced transparently in the UI** rather than silently manipulated or rounded.

---

## AI Collaboration & Engineering Verification Disclosure

In adherence to **Principle VI (Engineered AI Collaboration & Transparency)** of the project constitution, all AI-generated code and architectural suggestions were subjected to rigorous human engineering review:

1. **Architectural Decisions & Scope Management**:
   - *AI Proposal*: Automatically seed the database upon container startup using an implicit entrypoint check.
   - *Engineer Review*: Rejected. The engineer requested explicit separation: a standalone seed command (`npm run db:seed`) to make database population deterministic, testable, and under human control.
   - *AI Proposal*: Introduce a dedicated Nginx container for production reverse proxying and static file serving.
   - *Engineer Review*: Challenged and simplified. The engineer questioned the necessity of Nginx for the assignment scope. Following Constitution Principle I (Scope-Appropriate Simplicity), the stack was refactored to let Express serve the compiled React SPA directly (`express.static`), eliminating the Nginx container, removing unnecessary reverse proxy configuration, and unifying everything onto port 3000.
2. **Port Conflict Resolution**:
   - *Issue Detected*: On macOS, port `5000` is reserved by the OS `ControlCenter` (AirPlay Receiver).
   - *Verification & Fix*: Inspecting port bindings revealed `address already in use`. The backend port was mapped to `5001:5000` on the host, and Vite proxy / Nginx reverse proxy configurations were updated accordingly without changing container-internal networking.
3. **Module Format & Typing Issues**:
   - *Issue Detected*: TypeScript build initially flagged `import.meta.url` in seed scripts due to missing `"type": "module"` in `backend/package.json`.
   - *Verification & Fix*: Configured proper ES Module resolution across backend and frontend, and added `vite/client` type definitions for CSS Modules.
4. **Specification & Clarification Governance**:
   - Prior to writing code, five core ambiguities were formally clarified with the engineer:
     - Immediate single-click response without artificial 300ms debounce.
     - Following HATEOAS `state.detail` URL convention rather than hardcoding backend routes on the client.
     - Neutral placeholder state on initial load.
     - In-memory highlight storage without unnecessary persistence layer.
     - 3-column layout on desktop viewports.

---

## Spec Kit Artifacts

All specification, planning, and task artifacts are tracked in `specs/001-state-population-browser/`:
- [spec.md](file:///Users/ilya/Projects/idt-test-app/specs/001-state-population-browser/spec.md) — Functional requirements, user stories, acceptance scenarios, and clarified decisions.
- [plan.md](file:///Users/ilya/Projects/idt-test-app/specs/001-state-population-browser/plan.md) — Architecture design and Constitution compliance verification.
- [data-model.md](file:///Users/ilya/Projects/idt-test-app/specs/001-state-population-browser/data-model.md) — PostgreSQL DDL schema and TypeScript interfaces.
- [contracts/states-api.yaml](file:///Users/ilya/Projects/idt-test-app/specs/001-state-population-browser/contracts/states-api.yaml) — OpenAPI 3.0 specification for REST endpoints.
- [tasks.md](file:///Users/ilya/Projects/idt-test-app/specs/001-state-population-browser/tasks.md) — Dependency-ordered implementation checklist.
- [.specify/memory/constitution.md](file:///Users/ilya/Projects/idt-test-app/.specify/memory/constitution.md) — Core project principles and governance constraints.
