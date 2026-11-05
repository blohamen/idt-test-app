# Quickstart Guide: State Population Browser

## Prerequisites

- **Node.js**: `v20.x` or later
- **Docker & Docker Compose**: v2.x or later
- **PostgreSQL**: Included via Docker, or local instance on port 5432

---

## 1. Running with Docker Compose (Recommended)

1. **Clone the repository**:
   ```bash
   git clone <repo-url>
   cd idt-test-app
   ```

2. **Start the application (2 containers: PostgreSQL + Unified App)**:
   ```bash
   docker compose up --build -d
   ```

3. **Run the database seed script**:
   ```bash
   docker compose exec app npm run db:seed
   ```

4. **Access the application**:
   - Web UI & REST API: `http://localhost:3000`
   - States Endpoint: `http://localhost:3000/states`
   - Health check: `http://localhost:3000/health`

---

## 2. Running Locally (Without Docker)

1. **Install dependencies**:
   ```bash
   npm run install:all
   ```

2. **Set up local PostgreSQL database**:
   - Configure `.env` in `backend/` with database credentials:
     ```env
     PORT=3000
     DATABASE_URL=postgres://postgres:postgrespassword@localhost:5432/states_db
     ```

3. **Migrate schema & run seed**:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

4. **Start backend and frontend in development mode**:
   ```bash
   npm run dev:backend
   npm run dev:frontend
   ```
