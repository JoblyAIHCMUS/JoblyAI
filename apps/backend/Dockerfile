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

# Install ALL dependencies (including devDeps for build)
RUN --mount=type=cache,id=pnpm,target=/pnpm/store,uid=1000,gid=1000,mode=0777 \
    pnpm install --frozen-lockfile

# Copy source code and Prisma schema
COPY apps/backend ./apps/backend
COPY libs ./libs

# 1. Generate Prisma Client into the source directory (as defined in schema.prisma)
RUN cd apps/backend && pnpm exec prisma generate

# 2. Sync and Build (Webpack will now bundle the generated client)
RUN pnpm exec nx sync --yes
RUN pnpm exec nx build backend --prod

# Production stage
FROM node:22-alpine AS production

ENV NODE_ENV=production
# Help Prisma find the engine in bundled environment
ENV PRISMA_QUERY_ENGINE_LIBRARY=/app/apps/backend/dist/libquery_engine-linux-musl-openssl-3.0.x.so.node

# Critical runtime libraries
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app
RUN chown -R node:node /app
USER node

# Copy build artifacts and package manifest
COPY --chown=node:node --from=base /app/apps/backend/package.json ./apps/backend/package.json
COPY --chown=node:node --from=base /app/apps/backend/dist ./apps/backend/dist

# Copy the engine binary explicitly to the dist folder (where main.js is)
# We find it from the base stage where prisma generate was run
COPY --chown=node:node --from=base /app/apps/backend/src/generated/prisma/libquery_engine-linux-musl-openssl-3.0.x.so.node ./apps/backend/dist/

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "apps/backend/dist/main"]
