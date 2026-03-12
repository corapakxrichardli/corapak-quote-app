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
DATABASE_URL="postgresql://neondb_owner:npg_KRAxtlCgL1m6@ep-twilight-tree-akv56k7h-pooler.c-3.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require" npm run db:migrate
DATABASE_URL="postgresql://neondb_owner:npg_KRAxtlCgL1m6@ep-twilight-tree-akv56k7h-pooler.c-3.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require" npm run db:seed
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
2. Add or update environment variables:
   - **`FRONTEND_URL`** – Your main Vercel URL(s), comma-separated (e.g. `https://corapak-quote-app-frontend.vercel.app`)
   - **`ALLOW_VERCEL_PREVIEWS`** – Set to `true` to allow all `*.vercel.app` URLs (covers every Vercel deployment URL, including previews). Recommended if you use multiple Vercel URLs.
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

**"Failed to fetch" when adding a customer (or any API call):**

1. **CORS** – Set `ALLOW_VERCEL_PREVIEWS=true` in Render to allow all `*.vercel.app` URLs. Or ensure `FRONTEND_URL` exactly matches the URL in the browser’s address bar.
2. **Cold start** – On Render’s free tier, the backend sleeps after ~15 min idle. The first request can take 30–60 seconds and may timeout. Try again after a short wait.
3. **Backend URL** – Confirm `NEXT_PUBLIC_API_URL` in Vercel is `https://corapak-quote-api.onrender.com/api/v1`.

**Database connection failed:** Ensure `?sslmode=require` is in the Neon connection string if required.
