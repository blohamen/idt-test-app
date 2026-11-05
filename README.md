# US State Population Browser

A fullstack web application for exploring US state and county demographic data, verifying population totals against county sums, and interacting with synchronized dual lists. Built for the **IDT NRS Fullstack** test assignment following the **Spec Kit** methodology (Lean preset).

- **Tech Stack**: React 18, TypeScript, Vite, CSS Modules, Node.js + Express, PostgreSQL 16, Docker.
- **Data Integrity**: Raw mock data imported without alteration; Iowa's known `+1` population anomaly (county sum 3,090,416 vs recorded 3,090,415) is preserved in storage and flagged explicitly in the UI.

---

## Quickstart (Docker)

```bash
# 1. Start database and application (unified web UI & API on port 3000)
docker compose up --build -d

# 2. Seed database from raw mock data (51 states, 3,143 counties)
docker compose exec app npm run db:seed
```

- **Web UI & API**: [http://localhost:3000](http://localhost:3000)
- **API Endpoint**: [http://localhost:3000/states](http://localhost:3000/states)
- **Healthcheck**: [http://localhost:3000/health](http://localhost:3000/health)

To stop containers: `docker compose down`.

---

## Local Development (Without Docker)

```bash
npm run install:all
npm run docker:db        # Starts PostgreSQL container (or use local Postgres on :5432)
npm run db:migrate && npm run db:seed
npm run dev:backend      # Port 5001 (tsx watch)
npm run dev:frontend     # Port 3000 (Vite HMR, proxies API to 5001)
```
*See [quickstart.md](specs/001-state-population-browser/quickstart.md) and [.env.example](.env.example) for detailed environment configuration.*

---

## Testing

Run all 21 automated unit and integration tests across backend and frontend:

```bash
npm test
```

---

## AI Collaboration & Engineering Verification

In adherence to Principle VI of the project constitution, all AI proposals were reviewed and verified by an engineer:

1. **Architecture Simplification (Nginx Removal)**:
   - *AI Proposal*: Add a separate Nginx container for production reverse proxying.
   - *Review & Fix*: Rejected as over-engineering for this scope (Principle I). Refactored to let Express serve the compiled React SPA directly (`express.static`), eliminating an entire container and reverse-proxy layer while unifying the app onto port 3000.
2. **Deterministic Seeding**:
   - *AI Proposal*: Automatically seed the database upon container startup using an implicit entrypoint check.
   - *Review & Fix*: Rejected. Separated into an explicit standalone command (`npm run db:seed`) to ensure reproducible, human-controlled testing.
3. **Environment & Runtime Fixes**:
   - Identified and resolved macOS port 5000 AirPlay collision.
   - Configured ES Module resolution (`"type": "module"`) for backend TypeScript scripts.
   - Fixed double-click event handling: added in-flight request tracking and client-side caching to prevent duplicate API requests on double-clicks and repeated selections.

---

## Spec Kit Artifacts

Complete feature design, governance, and analysis documents:
- [spec.md](specs/001-state-population-browser/spec.md) — Functional requirements, user stories, acceptance scenarios, and clarified decisions.
- [plan.md](specs/001-state-population-browser/plan.md) — Architecture design and Constitution compliance verification.
- [data-model.md](specs/001-state-population-browser/data-model.md) — PostgreSQL DDL schema and TypeScript interfaces.
- [contracts/states-api.yaml](specs/001-state-population-browser/contracts/states-api.yaml) — OpenAPI 3.0 specification for REST endpoints.
- [tasks.md](specs/001-state-population-browser/tasks.md) — Dependency-ordered implementation checklist.
- [constitution.md](.specify/memory/constitution.md) — Core project principles and governance constraints.
