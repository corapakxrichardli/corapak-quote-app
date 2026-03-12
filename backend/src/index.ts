import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import customersRouter from './routes/customers.js';
import customerCommitmentsRouter from './routes/customerCommitments.js';
import quotesRouter from './routes/quotes.js';

const app = express();
const PORT = Number(process.env.PORT) || Number(process.env.BACKEND_PORT) || 3001;

// Security: restrict CORS in production to frontend URL(s) only
// FRONTEND_URL: "https://your-app.vercel.app" or comma-separated list
// Set ALLOW_VERCEL_PREVIEWS=true to also allow any *.vercel.app (covers all Vercel deployment URLs)
const frontendUrls = process.env.FRONTEND_URL?.split(',').map((u) => u.trim()).filter(Boolean) ?? [];
const allowVercelPreviews = process.env.ALLOW_VERCEL_PREVIEWS === 'true';
const corsOptions = frontendUrls.length || allowVercelPreviews
  ? {
      origin: (origin: string | undefined, cb: (err: Error | null, allow?: boolean) => void) => {
        if (!origin) return cb(null, true);
        if (frontendUrls.includes(origin)) return cb(null, true);
        if (allowVercelPreviews && origin.endsWith('.vercel.app')) return cb(null, true);
        cb(null, false);
      },
    }
  : {};
app.use(cors(corsOptions));

app.use(helmet({ contentSecurityPolicy: false })); // disable CSP to avoid breaking Next.js
app.use(express.json());

// Rate limiting: 100 requests per 15 minutes per IP
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
}));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/v1/customers', customersRouter);
app.use('/api/v1/customer-commitments', customerCommitmentsRouter);
app.use('/api/v1/quotes', quotesRouter);

app.listen(PORT, () => {
  console.log(`Corapak Quote API running at http://localhost:${PORT}`);
});
