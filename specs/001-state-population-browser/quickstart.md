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

2. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```

3. **Start the application (2 containers: PostgreSQL + Unified App)**:
   ```bash
   docker compose up --build -d
   ```

4. **Run the database seed script**:
   ```bash
   docker compose exec app npm run db:seed
   ```

5. **Access the application**:
   - Web UI: `http://localhost:3000`
   - States Endpoint: `http://localhost:3000/states`
   - Health check: `http://localhost:3000/health`



---

## 2. Running Locally for Development

1. **Install dependencies**:
   ```bash
   npm run install:all
   ```

2. **Configure environment**:
   ```bash
   cp .env.example backend/.env
   ```

3. **Start PostgreSQL database**:
   - Use your local Postgres instance, or spin up just the database container:
     ```bash
     npm run docker:db
     ```

4. **Migrate schema & run seed**:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

5. **Start backend and frontend development servers**:
   ```bash
   # Terminal 1: Backend with tsx watch on port 5001
   npm run dev:backend

   # Terminal 2: Frontend with Vite HMR on port 3000
   npm run dev:frontend
   ```
   Open `http://localhost:3000`.
