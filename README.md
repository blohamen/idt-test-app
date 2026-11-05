# US State Population Browser

A fullstack web application for exploring US state and county demographic data, verifying population totals against county sums, and interacting with synchronized dual lists. Built for the **IDT NRS Fullstack** test assignment following the **Spec Kit** methodology (Lean preset).

- **Tech Stack**: React 18, TypeScript, Vite, CSS Modules, Node.js + Express, PostgreSQL 16, Docker.
- **Robust Architecture**: REST APIs scoped under `/api`, NestJS-style `HttpException` hierarchy with `asyncHandler`, structured contextual logging (`Logger`), and graceful process termination (`SIGTERM`/`SIGINT`).
- **Data Integrity**: Raw mock data imported without alteration; Iowa's known `+1` population anomaly (county sum 3,090,416 vs recorded 3,090,415) is preserved in storage and flagged explicitly in the UI.

---

## Quickstart (Docker)

```bash
# 1. Create environment file from template
cp .env.example .env

# 2. Start database and application (unified web UI & API on port 3000)
docker compose up --build -d

# 3. Seed database from raw mock data (51 states, 3,143 counties)
docker compose exec app npm run db:seed
```


- **Web UI**: [http://localhost:3000](http://localhost:3000)
- **API Endpoint**: [http://localhost:3000/api/states](http://localhost:3000/api/states)
- **Healthcheck**: [http://localhost:3000/api/health](http://localhost:3000/api/health)

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

Run all 48 automated unit and integration tests across backend and frontend:


```bash
npm test
```

---

## Spec Kit Artifacts

Complete feature design, governance, and analysis documents:
- [spec.md](specs/001-state-population-browser/spec.md) — Functional requirements, user stories, acceptance scenarios, and clarified decisions.
- [plan.md](specs/001-state-population-browser/plan.md) — Architecture design and Constitution compliance verification.
- [data-model.md](specs/001-state-population-browser/data-model.md) — PostgreSQL DDL schema and TypeScript interfaces.
- [contracts/states-api.yaml](specs/001-state-population-browser/contracts/states-api.yaml) — OpenAPI 3.0 specification for REST endpoints.
- [tasks.md](specs/001-state-population-browser/tasks.md) — Dependency-ordered implementation checklist.
- [constitution.md](.specify/memory/constitution.md) — Core project principles and governance constraints.
