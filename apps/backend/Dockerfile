# Base stage: install dependencies and build the backend
FROM node:22-alpine AS base

# Set environment variables
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_OPTIONS="--max-old-space-size=2048"

RUN corepack enable

# Pre-install essential build tools
RUN mkdir -p /pnpm && chmod -R 777 /pnpm && apk add --no-cache libc6-compat openssl git

# Set working directory
WORKDIR /app

# Copy workspace configuration
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY nx.json tsconfig.base.json tsconfig.json eslint.config.mjs ./

# Copy ALL package.json files for workspace discovery
COPY apps/backend/package.json ./apps/backend/
COPY libs/shared-types/package.json ./libs/shared-types/

# Install ALL dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store,uid=1000,gid=1000,mode=0777 \
    pnpm install --frozen-lockfile

# Copy source code
COPY apps/backend ./apps/backend
COPY libs ./libs

# 1. Generate Prisma Client
RUN cd apps/backend && pnpm exec prisma generate

# 2. Sync and Build
RUN pnpm exec nx sync --yes
RUN pnpm exec nx build backend --prod

# Production stage
FROM node:22-alpine AS production

ENV NODE_ENV=production

# Critical runtime libraries
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app
RUN chown -R node:node /app

# Copy necessary manifests and schema
COPY --chown=node:node pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY --chown=node:node apps/backend/package.json ./apps/backend/package.json
COPY --chown=node:node apps/backend/prisma ./apps/backend/prisma/

# Copy the built application from base stage
COPY --chown=node:node --from=base /app/apps/backend/dist ./apps/backend/dist

# Install production-only dependencies
RUN corepack enable && \
    mkdir -p /pnpm && chmod -R 777 /pnpm && \
    pnpm install --prod --frozen-lockfile --filter @jobly/backend

# Generate Prisma client for production (This creates the engine file)
RUN cd apps/backend && pnpm exec prisma generate

# Help Prisma find the engine in production (Set AFTER generate to avoid validation error)
ENV PRISMA_QUERY_ENGINE_LIBRARY=/app/node_modules/.prisma/client/libquery_engine-linux-musl-openssl-3.0.x.so.node

USER node

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "apps/backend/dist/main"]
