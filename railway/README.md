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
   - `AWS_BUCKET`, `AWS_REGION` (and `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` if not from Railway AWS plugin)
3. **S3 bucket** – for uploads (or Cloudflare R2, MinIO). **Important:** set CORS on the bucket so the browser can read the PUT response; otherwise uploads can reach 100% and never “complete” in production. See [CORS for uploads](#cors-for-uploads) below.

## CORS for uploads

If uploads show “Uploading: 100%” but never finish (modal doesn’t close, no success toast), the bucket is missing CORS. The browser sends the file to the presigned URL but then blocks the response without CORS.

**AWS S3** – Bucket → Permissions → CORS, add:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedOrigins": ["https://your-production-domain.com", "https://www.your-production-domain.com"],
    "ExposeHeaders": ["ETag"]
  }
]
```

Use your real app origin(s). For local testing you can add `http://localhost:5174` (and 5173, etc.).

**Cloudflare R2** – Bucket → Settings → CORS policy, same idea: allow your origin(s), methods `GET`, `PUT`, `HEAD`, and expose `ETag` if needed.

After saving CORS, retry the upload.

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
| S3 | `AWS_BUCKET`, `AWS_REGION` | Railway |
