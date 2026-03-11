# Project Structure (Corapak Quote App)

**Terminology:** Fulfillment → **Customer Commitment**

---

```
corapak-quote-app/
├── README.md
├── package.json
├── .env.example
├── .gitignore
├── docker-compose.yml
│
├── frontend/                    # Next.js app (quote intake UI)
│   └── src/
│       ├── app/
│       ├── components/quotes/
│       └── lib/
│
├── backend/                     # Node.js API server
│   └── src/
│       ├── config/
│       ├── db/
│       ├── routes/
│       └── services/pricingEngine/
│
└── docs/
    ├── 00-project-structure.md
    ├── 01-database-schema.md
    ├── 02-api-design.md
    ├── 03-pricing-engine.md
    ├── 04-frontend-form.md
    └── 05-seed-data.md
```
