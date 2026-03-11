# Free Deployment Guide (Vercel + Render + Neon)

This guide deploys the Corapak Quote App for **free** using:

- **Vercel** – Next.js frontend (HTTPS, global CDN, free forever)
- **Render** – Express backend (750 free hours/month, spins down when idle)
- **Neon** – PostgreSQL database (free tier, no expiry)

## Security Measures (Included)

- **CORS** – API only accepts requests from your frontend domain(s)
- **Helmet** – Security headers (X-Content-Type-Options, X-Frame-Options, etc.)
- **Rate limiting** – 100 requests per 15 minutes per IP
- **HTTPS** – All platforms serve over TLS
- **Secrets** – Database URL and URLs stored as env vars, never in code

## Prerequisites

- GitHub account
- [Vercel](https://vercel.com) account
- [Render](https://render.com) account
- [Neon](https://neon.tech) account

---

## Step 1: Create PostgreSQL Database (Neon)

1. Go to [neon.tech](https://neon.tech) and sign in.
2. Create a new project (e.g. `corapak-quotes`).
3. Copy the **connection string** (looks like `postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require`).
4. Keep this for Step 3.

---

## Step 2: Deploy Backend (Render)

1. Push your repo to GitHub (if not already).
2. Go to [render.com](https://render.com) → **New** → **Web Service**.
3. Connect your GitHub repo.
4. Configure:
   - **Name:** `corapak-quote-api`
   - **Root directory:** Leave **empty** (Render’s Root Directory field can reject some values; we’ll use the repo root instead)
   - **Runtime:** Node
   - **Build command:** `cd backend && npm install && npm run build`
   - **Start command:** `cd backend && npm start`
5. Under **Environment**, add:
   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | Your Neon connection string (from Step 1) |
   | `FRONTEND_URL` | Leave empty for now; add after Step 3 |
   | `NODE_ENV` | `production` |
6. Click **Create Web Service**.
7. Wait for deploy, then copy your backend URL (e.g. `https://corapak-quote-api.onrender.com`).

---

## Step 3: Run Migrations & Seed (One-time)

Render free services spin down when idle. To run migrations, use a one-off run or your local machine with the Neon URL.

**Option A – Local (recommended):**

```bash
cd backend
DATABASE_URL="postgresql://your-neon-url?sslmode=require" npm run db:migrate
DATABASE_URL="postgresql://your-neon-url?sslmode=require" npm run db:seed
```

**Option B – Render Shell:** Render’s dashboard has a Shell; you can run the same commands there.

---

## Step 4: Deploy Frontend (Vercel)

1. Go to [vercel.com](https://vercel.com) → **Add New** → **Project**.
2. Import your GitHub repo.
3. Configure:
   - **Root directory:** `frontend`
   - **Framework preset:** Next.js
4. Under **Environment Variables**, add:
   | Key | Value |
   |-----|-------|
   | `NEXT_PUBLIC_API_URL` | `https://corapak-quote-api.onrender.com/api/v1` |
5. Deploy.
6. Copy your Vercel URL (e.g. `https://corapak-quote-app.vercel.app`).

---

## Step 5: Secure the Backend (CORS)

1. In Render → your **Web Service** → **Environment**.
2. Add or update `FRONTEND_URL` with your Vercel URL(s) (comma-separated):
   - Production: `https://corapak-quote-app.vercel.app`
   - With preview deployments: add each preview URL as needed (e.g. `https://corapak-quote-app.vercel.app,https://corapak-quote-app-xyz123.vercel.app`)
3. Save. Render will redeploy.

---

## Step 6: Optional – Password Protection (Internal Use)

For an internal tool, you can lock the app:

- **Vercel:** Project → Settings → Deployment Protection → enable **Password Protection** (Pro plan).
- **Render:** No built-in password protection on free tier.
- **Alternative:** Use [Vercel’s Preview Protection](https://vercel.com/docs/security/secure-development-workflow) or add basic auth in the app.

---

## Free Tier Limits

| Service | Limit |
|---------|-------|
| **Vercel** | 100GB bandwidth, unlimited deployments |
| **Render** | 750 hrs/month, spins down after 15 min idle |
| **Neon** | 0.5 GB storage, 100 compute-hours/month, auto-suspend after 5 min |

**Render cold starts:** First request after idle may take ~30–60 seconds. For an internal app, this is usually acceptable.

---

## Custom Domain (Optional)

- **Vercel:** Add domain in Project → Settings → Domains.
- **Render:** Custom domains supported on free tier.
- Remember to update `FRONTEND_URL` if you change the frontend domain.

---

## Troubleshooting

**CORS errors:** Ensure `FRONTEND_URL` in Render matches the exact URL (including `https://`) of your Vercel app.

**Database connection failed:** Ensure `?sslmode=require` is in the Neon connection string if required.

**Backend timeout on first load:** Render free tier spins down; the first request after idle triggers a cold start.
