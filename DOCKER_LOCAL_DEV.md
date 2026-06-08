# Docker Local Dev Guide

This guide covers Docker workflows for local development and production-like
testing on a developer machine.

## When to use `--profile local-db`

Use `--profile local-db` only when you want Docker Compose to start the local
Postgres container.

The `postgres` service is behind the `local-db` profile in `docker-compose.yml`,
so Compose will not include it by default. This is intentional because real
production can use an external database instead of the local Docker Postgres.

## Backend env for Docker

When the backend runs inside Docker, `localhost` means the backend container
itself. Use Docker service hostnames for local Docker services:

```env
DATABASE_URL=postgres://jobly:jobly@postgres:5432/jobly_db
REDIS_URL=redis://redis:6379
SCYLLA_HOST=scylla
SCYLLA_PORT=9042
SCYLLA_KEYSPACE=jobly
```

For production or staging with external services, use the real external hostnames
instead:

```env
DATABASE_URL=postgres://user:password@your-db-host:5432/db_name
REDIS_URL=redis://your-redis-host:6379
SCYLLA_HOST=your-scylla-host
```

## Local Docker DB + production-like app

Use this when you want to run the full local Docker stack: Postgres, Redis,
Scylla, backend, web, and nginx.

Use `-f docker-compose.yml` so Compose does not apply
`docker-compose.override.yml` dev overrides.

1. Start database and infrastructure services:

```bash
docker compose -f docker-compose.yml --profile local-db up -d postgres redis scylla scylla-init
```

2. Build production images:

```bash
docker compose -f docker-compose.yml --profile local-db build backend web
```

For a full backend rebuild without Docker layer cache:

```bash
docker compose -f docker-compose.yml --profile local-db build --no-cache backend
```

3. Apply Prisma migrations against local Docker Postgres:

```bash
docker compose -f docker-compose.yml --profile local-db run --rm --no-deps backend npx prisma migrate deploy
```

4. Recreate and start app containers:

```bash
docker compose -f docker-compose.yml --profile local-db up -d --force-recreate backend web nginx
```

5. Verify the stack:

```bash
docker compose -f docker-compose.yml --profile local-db ps
```

Expected local URLs:

- Nginx/web: `http://localhost`
- Web direct: `http://localhost:3001`
- Backend API: `http://localhost:3000/api`
- Swagger: `http://localhost:3000/api/docs`

## External DB production-like app

Use this when the database, Redis, or Scylla services live outside Docker.
Do not use `--profile local-db` in this case.

Make sure `apps/backend/.env` points to those external services, then run:

```bash
docker compose -f docker-compose.yml build backend web
docker compose -f docker-compose.yml run --rm --no-deps backend npx prisma migrate deploy
docker compose -f docker-compose.yml up -d --force-recreate backend web nginx
docker compose -f docker-compose.yml ps
```

## Useful checks

View container status:

```bash
docker compose -f docker-compose.yml --profile local-db ps
```

View backend logs:

```bash
docker compose -f docker-compose.yml --profile local-db logs --tail=120 backend
```

Test the local endpoints:

```bash
curl http://localhost
curl http://localhost:3000/api
curl http://localhost:3000/api/docs
```

## Common issues

- Backend cannot connect to Postgres: check that `DATABASE_URL` uses `postgres`
  for local Docker DB, not `localhost`.
- Backend cannot connect to Redis: check that `REDIS_URL` uses `redis` for local
  Docker Redis.
- Backend cannot connect to Scylla: check that `SCYLLA_HOST=scylla` for local
  Docker Scylla.
- Backend is unhealthy after startup: inspect logs with
  `docker compose -f docker-compose.yml --profile local-db logs --tail=120 backend`.
- Need a clean local DB: stop the stack and remove the `postgres_data` volume
  only if you intentionally want to delete local database data.
