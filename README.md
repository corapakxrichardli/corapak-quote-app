# Corapak Quote App

Internal quote intake tool for a bespoke packaging company. Sales reps use a multi-step form to capture deal requirements; the system applies rule-based pricing and produces internal review summaries and customer-facing quote drafts.

## Quick Start

```bash
# 1. Start PostgreSQL
docker-compose up -d

# 2. Install dependencies
npm install

# 3. Set up database
npm run db:migrate
npm run db:seed

# 4. Copy env and start
cp .env.example .env
npm run dev
```

- **Backend API:** http://localhost:3001
- **Frontend:** http://localhost:3000

## Deployment

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for free deployment (Vercel + Render + Neon) with security best practices.

## Structure

- `backend/` – Node.js + Express API, PostgreSQL, pricing engine
- `frontend/` – Next.js quote wizard and review screen
- `docs/` – Design docs (schema, API, pricing engine)

## Environment

| Variable | Description |
|----------|-------------|
| DATABASE_URL | PostgreSQL connection string |
| BACKEND_PORT | API server port (default 3001) |
| NEXT_PUBLIC_API_URL | API base URL for frontend |
| FRONTEND_URL | (Production) Comma-separated frontend origins for CORS |

**PostgreSQL (Homebrew on Mac):** Default user is your Mac username. In `.env` use:
```bash
DATABASE_URL=postgresql://YOUR_USERNAME@localhost:5432/corapak_quotes
# or (often works with peer auth):
DATABASE_URL=postgresql://localhost:5432/corapak_quotes
```
