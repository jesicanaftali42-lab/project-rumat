#!/usr/bin/env bash
set -euo pipefail

ENV_PATH=${1:-backend/.env}
OUT=${2:-rumat_db.dump}

if [ ! -f "$ENV_PATH" ]; then
  echo "Env file not found: $ENV_PATH"
  exit 1
fi

# Load env vars (simple KEY=VALUE parser, ignores comments)
export $(grep -v '^\s*#' "$ENV_PATH" | xargs)

: ${DB_HOST:=127.0.0.1}
: ${DB_PORT:=5432}
: ${DB_USERNAME:=postgres}
: ${DB_PASSWORD:=}
: ${DB_DATABASE:=rumat_db}

if ! command -v pg_dump >/dev/null 2>&1; then
  echo "pg_dump not found in PATH. Install PostgreSQL client or use Docker." >&2
  exit 1
fi

echo "Exporting database '$DB_DATABASE' from $DB_HOST:$DB_PORT as user $DB_USERNAME to $OUT"

PGPASSWORD="$DB_PASSWORD" pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USERNAME" -F c -b -v -f "$OUT" "$DB_DATABASE"

echo "✅ Dump saved to $OUT"
