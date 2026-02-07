#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

pnpm --filter @jobly/backend exec prisma generate
pnpm --filter @jobly/backend exec prisma migrate dev
pnpm nx run @jobly/backend:start:dev
