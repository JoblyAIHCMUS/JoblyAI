# Docker Local Dev Guide

This guide explains how to run JoblyAI with Docker on a personal development
machine.

By default, `docker compose` uses both files:

- `docker-compose.yml`
- `docker-compose.override.yml`

For local development, do not pass `-f docker-compose.yml`. The override file
configures the backend to run in dev/watch mode.

## Prerequisites

Make sure these are installed:

- Docker Desktop
- Git
- The following local ports are available:
  - `3000`: backend
  - `3001`: web
  - `5432`: Postgres
  - `6379`: Redis
  - `9042`: ScyllaDB

If another local service is already using one of these ports, stop that service
before starting Docker.

## Backend Environment File

The backend reads environment variables from:

```text
apps/backend/.env
```

When the backend runs inside Docker, do not use `localhost` for Postgres, Redis,
or ScyllaDB. Inside a container, `localhost` points to that container itself.
Use Docker Compose service names instead:

```env
DATABASE_URL=postgres://jobly:jobly@postgres:5432/jobly_db
REDIS_URL=redis://redis:6379
SCYLLA_HOST=scylla
SCYLLA_PORT=9042
SCYLLA_KEYSPACE=jobly
```

The local Postgres service in `docker-compose.yml` uses:

```env
POSTGRES_USER=jobly
POSTGRES_PASSWORD=jobly
POSTGRES_DB=jobly_db
```

## Run Backend Local Dev With Docker

Run this command from the repository root:

```powershell
docker compose --profile local-db up -d postgres redis scylla scylla-init backend
```

This starts:

- `postgres`: local Postgres database
- `redis`: local Redis instance
- `scylla`: local ScyllaDB instance
- `scylla-init`: Scylla schema initialization
- `backend`: NestJS backend in dev/watch mode

The `--profile local-db` flag is required because the `postgres` service belongs
to the `local-db` profile. Without this profile, the local Postgres container
will not start.

The backend dev container automatically runs:

```sh
pnpm install --no-frozen-lockfile
pnpm --filter @jobly/backend exec prisma generate
pnpm --filter @jobly/backend exec prisma migrate dev
cd /app/apps/backend && pnpm run start:dev
```

Watch the backend logs:

```powershell
docker compose logs -f backend
```

Wait until Prisma migrations finish and the backend dev server starts
successfully.

Local backend URLs:

- API: `http://localhost:3000/api`
- Swagger: `http://localhost:3000/api/docs`

## Run Web Local Dev With Docker

If you also need the web app:

```powershell
docker compose --profile local-db up -d postgres redis scylla scylla-init backend web
```

Local web URL:

- `http://localhost:3001`

Backend URLs remain:

- `http://localhost:3000/api`
- `http://localhost:3000/api/docs`

## Seed Development Data

Only seed after the backend has finished running Prisma migrations. Check the
backend logs first:

```powershell
docker compose logs -f backend
```

Seed the full development/mock dataset:

```powershell
docker compose exec -e SEED_MODE=development backend sh -lc "cd /app/apps/backend && pnpm exec ts-node prisma/seed.ts"
```

`SEED_MODE=development` deletes existing local database data and recreates the
mock development dataset, including:

- job categories
- skills
- users
- candidate profiles
- companies
- employers
- job postings
- job requirements
- resume metadata
- applications
- verification records

Use this mode when you want to reset local development data back to the default
mock state.

## Seed System Data Only

If you do not want to delete existing users, jobs, or applications, seed only
base system data:

```powershell
docker compose exec -e SEED_MODE=system backend sh -lc "cd /app/apps/backend && pnpm exec ts-node prisma/seed.ts"
```

`SEED_MODE=system` only syncs:

- job categories
- skills

## Verify Seeded Data

Check the number of users:

```powershell
docker compose exec postgres psql -U jobly -d jobly_db -c "select count(*) from \"user\";"
```

Check the number of jobs:

```powershell
docker compose exec postgres psql -U jobly -d jobly_db -c "select count(*) from \"JobPosting\";"
```

Open Swagger to test the API:

```text
http://localhost:3000/api/docs
```

## If Seeding Fails

If seeding fails because the schema is not ready, run Prisma migrations manually:

```powershell
docker compose exec backend sh -lc "pnpm --filter @jobly/backend exec prisma migrate dev"
```

Then run the seed command again:

```powershell
docker compose exec -e SEED_MODE=development backend sh -lc "cd /app/apps/backend && pnpm exec ts-node prisma/seed.ts"
```

If the backend is not ready, inspect the latest backend logs:

```powershell
docker compose logs --tail=120 backend
```

## Useful Local Dev Commands

View running containers:

```powershell
docker compose ps
```

Follow backend logs:

```powershell
docker compose logs -f backend
```

Follow web logs:

```powershell
docker compose logs -f web
```

Restart the backend:

```powershell
docker compose restart backend
```

Stop all containers:

```powershell
docker compose down
```

Stop all containers and remove local volumes:

```powershell
docker compose down -v
```

`docker compose down -v` deletes the local Docker database. Use it only when you
intentionally want to reset all local data.

## Recommended Daily Workflow

1. Start the backend and local services:

```powershell
docker compose --profile local-db up -d postgres redis scylla scylla-init backend
```

2. Follow backend logs:

```powershell
docker compose logs -f backend
```

3. On first setup, or when you want to reset local data, run seed:

```powershell
docker compose exec -e SEED_MODE=development backend sh -lc "cd /app/apps/backend && pnpm exec ts-node prisma/seed.ts"
```

4. Open Swagger:

```text
http://localhost:3000/api/docs
```

5. If you need the web app:

```powershell
docker compose --profile local-db up -d web
```

6. Open the web app:

```text
http://localhost:3001
```

## Troubleshooting

Backend cannot connect to Postgres:

- Check `apps/backend/.env`
- `DATABASE_URL` must use host `postgres`, not `localhost`
- Make sure Docker Compose was started with `--profile local-db`

Backend cannot connect to Redis:

- `REDIS_URL` must be `redis://redis:6379`
- Check the Redis container with `docker compose ps`

Backend cannot connect to ScyllaDB:

- `SCYLLA_HOST` must be `scylla`
- ScyllaDB can take longer to start than the other services
- Check Scylla logs with `docker compose logs -f scylla`

Port already in use:

- Stop the local service using port `3000`, `3001`, `5432`, `6379`, or `9042`
- Run `docker compose --profile local-db up -d ...` again

Reset everything from scratch:

```powershell
docker compose down -v
docker compose --profile local-db up -d postgres redis scylla scylla-init backend
docker compose logs -f backend
docker compose exec -e SEED_MODE=development backend sh -lc "cd /app/apps/backend && pnpm exec ts-node prisma/seed.ts"
```
