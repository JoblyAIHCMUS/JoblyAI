#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

mkdir -p SQL

docker compose exec -T postgres pg_dump -U jobly -d jobly_db \
  --data-only \
  --column-inserts \
  --disable-triggers \
  > SQL/populate_data.sql

echo "Wrote SQL/populate_data.sql"
