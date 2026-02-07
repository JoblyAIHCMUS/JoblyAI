# Maintenance Guide

This guide helps a new onboarder set up the repo and run the full stack locally.
It includes a recommended dev flow, optional scripts, and troubleshooting tips.

## Requirements
- Node 22.x and pnpm 9+ (use Corepack)
- Docker Desktop (for Postgres and Redis)
- macOS/iOS: Xcode + CocoaPods (for iOS)
- Android: Android Studio + emulator/device (for Android)
- Optional: `jq` for local data inspection

## Repo layout (high level)
- `apps/backend` NestJS API + Prisma
- `apps/web` Next.js web app
- `apps/mobile` React Native (native + web preview)
- `libs/shared-types` shared TypeScript types
- `scripts` helper scripts for local setup and DB workflows

## First-time setup
1) Clone the repo and install deps
```bash
git clone https://github.com/JoblyAIHCMUS/JoblyAI.git
cd JoblyAI
corepack enable
corepack prepare pnpm@latest --activate
pnpm install
```

2) Configure backend env
- Copy the example file and adjust values as needed:
```bash
cp apps/backend/.env.example apps/backend/.env
```
- See apps/backend/AUTH_SETUP.md for required variables (DB, Redis, Better Auth, CORS).

3) Sanity-check tooling (optional but recommended)
```bash
node -v
pnpm -v
docker --version
```

4) (Optional) Set up local domain for the web app
```bash
./scripts/setup_local_domain.sh
```
This maps `joblyAI-local.com` to `127.0.0.1` and is used by the web dev server.

## Run everything (local dev)
Recommended local dev flow uses Docker for infra and Nx for apps. Each step can be
run in its own terminal to keep logs separate.

1) Start Postgres and Redis
```bash
./scripts/run_external_services.sh
```

2) Prepare DB schema and run backend (NestJS)
```bash
./scripts/run_internal_services.sh
```
Backend will be available at `http://localhost:3000/api`.

3) Start the web app (Next.js)
```bash
./scripts/run_web.sh
```
Web will be available at `http://joblyAI-local.com:5173`.

4) Start the mobile app (React Native)
- iOS (macOS only):
```bash
./scripts/run_mobile_ios.sh
```
- Android:
```bash
./scripts/run_mobile_android.sh
```

## Service URLs and ports
- Backend API: `http://localhost:3000/api`
- Web dev server: `http://joblyAI-local.com:5173`
- Postgres: `localhost:5432` (db `jobly_db`, user `jobly`)
- Redis: `localhost:6379`

## Environment variables (backend)
These live in `apps/backend/.env`. Minimum local values:
```env
DATABASE_URL="postgres://jobly:jobly@localhost:5432/jobly_db"
REDIS_URL="redis://localhost:6379"
BETTER_AUTH_SECRET="dev-secret-change-me"
BETTER_AUTH_URL="http://localhost:3000"
APP_URL="http://localhost:3000"
WEB_URL="http://joblyAI-local.com:5173"
```

## One-command shortcuts
- Start infra + backend:
```bash
./scripts/run_all.sh
```
- Reset DB to empty (drops volumes):
```bash
./scripts/run_database_empty.sh
```
- Reset DB and apply latest schema:
```bash
./scripts/run_database_with_data.sh
```

## Database workflows
- Reset DB to empty volumes:
```bash
./scripts/run_database_empty.sh
```
- Generate schema-only SQL (no data):
```bash
./scripts/dump_schema_empty.sh
```
- Generate data-only SQL:
```bash
./scripts/dump_data_only.sh
```
- Generate full SQL dump:
```bash
./scripts/dump_all.sh
```

All dumps are written under the `SQL/` directory.

## Nx commands (if you prefer Nx directly)
- Start all dev servers (backend, web, mobile web):
```bash
pnpm start
```
- Backend dev:
```bash
pnpm nx serve @jobly/backend --configuration=development
```
- Web dev:
```bash
pnpm nx dev @jobly/web
```
- Mobile dev (Vite web preview):
```bash
pnpm nx dev @jobly/mobile
```

## Common dev tasks
- Apply new Prisma migrations after pulling changes:
```bash
pnpm --filter @jobly/backend exec prisma migrate dev
```
- Regenerate Prisma client after schema changes:
```bash
pnpm --filter @jobly/backend exec prisma generate
```
- Check project graph (useful in a monorepo):
```bash
pnpm nx graph
```

## Docker compose (production-like)
If you want a containerized backend and nginx:
```bash
docker compose up -d postgres redis
pnpm --filter @jobly/backend exec prisma generate
pnpm --filter @jobly/backend exec prisma migrate dev

docker compose up -d backend nginx
```
Backend runs on port 3000 and nginx on port 80.

## Troubleshooting
- Prisma errors: re-run `pnpm --filter @jobly/backend exec prisma generate`.
- Auth issues: verify values in `apps/backend/.env` and see `apps/backend/AUTH_SETUP.md`.
- Redis issues: confirm Redis is healthy with `docker compose ps`.
- Port already in use: stop other services or change ports in `docker-compose.yml`.
- Local domain not resolving: re-run `./scripts/setup_local_domain.sh` and flush DNS.
