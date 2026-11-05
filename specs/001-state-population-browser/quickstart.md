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

2. **Start the application**:
   ```bash
   docker compose up --build -d
   ```

3. **Run the database seed script**:
   ```bash
   docker compose exec backend npm run db:seed
   ```

4. **Access the application**:
   - Frontend UI: `http://localhost:3000`
   - Backend API: `http://localhost:5000/states`
   - Health check: `http://localhost:5000/health`

---

## 2. Running Locally (Without Docker)

1. **Install dependencies**:
   ```bash
   npm run install:all
   ```

2. **Set up local PostgreSQL database**:
   - Create database `states_db`
   - Configure `.env` in `backend/` with database credentials:
     ```env
     PORT=5000
     DATABASE_URL=postgres://postgres:postgres@localhost:5432/states_db
     ```

3. **Migrate schema & run seed**:
   ```bash
   npm --prefix backend run db:migrate
   npm --prefix backend run db:seed
   ```

4. **Start backend and frontend in development mode**:
   ```bash
   npm run dev
   ```
