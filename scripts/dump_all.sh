#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

mkdir -p SQL

docker compose exec -T postgres pg_dump -U jobly -d jobly_db \
  --no-owner \
  --no-acl \
  > SQL/dump_all.sql

echo "Wrote SQL/dump_all.sql"
