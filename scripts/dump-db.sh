#!/usr/bin/env bash
# Dump current database to SQL file
# Usage: npm run db:dump (loads DATABASE_URL from .env)
# Output: dumps/emc_dump_YYYYMMDD_HHMMSS.sql

set -e
cd "$(dirname "$0")/.."

# Load .env if present
if [ -f .env ]; then
  set -a
  source .env
  set +a
fi

if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL must be set"
  exit 1
fi

OUT_DIR="dumps"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
OUT_FILE="${OUT_DIR}/emc_dump_${TIMESTAMP}.sql"
mkdir -p "$OUT_DIR"

echo "Dumping to $OUT_FILE..."
pg_dump "$DATABASE_URL" --no-owner --no-acl -f "$OUT_FILE"
echo "Dump complete: $OUT_FILE"
echo ""
echo "Categories in dump:"
grep -A 100 "COPY public.categories" "$OUT_FILE" | grep -E "^\S" | head -20 || echo "(none or different format)"
