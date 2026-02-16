# Railway Deployment Config

Separate config, server entry, and S3 storage for Railway. Replit uses its own entry and GCS.

## Structure

| Path | Purpose |
|------|---------|
| `server/railway-index.ts` | Railway entry – no Vite, S3 storage, DEPLOYMENT_TARGET=railway |
| `server/index.ts` | Replit entry – Vite in dev, Replit Object Storage |
| `config/deployment.ts` | `getDeploymentTarget()`, `getStorageProvider()` |
| `config/railway.ts` | S3 bucket, region, endpoint |
| `server/storage/` | Storage abstraction: `s3.ts`, `replit-adapter.ts`, `factory.ts` |
| `railway.json` | Build/deploy commands, healthcheck |
| `.env.railway.example` | Variable template |

## Setup

1. **Railway project** – PostgreSQL + web service
2. **Variables** (from `.env.railway.example`):
   - `DEPLOYMENT_TARGET=railway`
   - `DATABASE_URL` (from PostgreSQL)
   - `SESSION_SECRET`, `STRIPE_SECRET_KEY`, `VITE_STRIPE_PUBLIC_KEY`
   - `ALLOWED_ORIGINS` – your Railway URL
   - `S3_BUCKET`, `AWS_REGION` (and `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` if not from Railway AWS plugin)
3. **S3 bucket** – for uploads (or Cloudflare R2, MinIO)

## Build & Deploy

Railway uses `build:railway` which bundles `railway-index.ts` instead of `index.ts`:

- No Replit/GCS imports
- S3 storage wired
- Static files only (no Vite dev server)

```
git pull origin main
git push deploy main
```

## Storage Providers

| Provider | Env | Used on |
|----------|-----|---------|
| Replit (GCS) | `PUBLIC_OBJECT_SEARCH_PATHS`, `PRIVATE_OBJECT_DIR` | Replit |
| S3 | `S3_BUCKET`, `AWS_REGION` | Railway |
