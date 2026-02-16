#!/usr/bin/env bash
# Restore PostgreSQL dump
# Usage: npm run db:restore [path-to-dump.sql]
#   If no path given, restores from ./dumps/emc_database_export.sql
#   Place your dump in dumps/ or pass the path: npm run db:restore -- /path/to/dump.sql

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

DUMP="${1:-dumps/emc_database_export.sql}"

if [ ! -f "$DUMP" ]; then
  echo "Error: Dump not found at $DUMP"
  echo "Place the dump file in dumps/ or pass the path: npm run db:restore -- /path/to/dump.sql"
  exit 1
fi

echo "Restoring from $DUMP..."
# Strip non-standard \restrict and \unrestrict lines (from some pg_dump variants)
grep -v -E '^\\(un)?restrict ' "$DUMP" | psql "$DATABASE_URL" -f -
echo "Restore complete."
