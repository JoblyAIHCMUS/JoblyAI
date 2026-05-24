# Base stage: install dependencies and build the backend
FROM node:22-alpine AS base

# Set environment variables
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_OPTIONS="--max-old-space-size=2048"

RUN corepack enable
RUN apk add --no-cache libc6-compat openssl git findutils

WORKDIR /app

# Copy workspace configuration
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY nx.json tsconfig.base.json tsconfig.json eslint.config.mjs ./

# Copy ALL package.json files for workspace discovery
COPY apps/web/package.json ./apps/web/
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
RUN pnpm exec nx sync --yes && pnpm exec nx build backend --prod

# 3. PNPM DEPLOY: Create a standalone flattened production folder
# This is the most reliable way to handle pnpm monorepos in Docker
RUN pnpm --filter @jobly/backend deploy --prod --legacy /deployed && \
    # Manually copy the build output into the deployed folder
    cp -r apps/backend/dist /deployed/dist && \
    # Manually copy prisma schema for migrations
    cp -r apps/backend/prisma /deployed/prisma

# 4. Generate Prisma engine inside the deployed folder to ensure correct paths
RUN cd /deployed && npx prisma generate && \
    find node_modules -name "libquery_engine-*.so.node" -exec cp {} /deployed/query-engine.so.node \;

# Production stage
FROM node:22-alpine AS production

ENV NODE_ENV=production
# Force Prisma to use our co-located engine
ENV PRISMA_QUERY_ENGINE_LIBRARY=/app/query-engine.so.node

# Critical runtime libraries
RUN apk add --no-cache libc6-compat openssl libgcc libstdc++ findutils

WORKDIR /app

# Copy the entire deployed folder (flattened node_modules + dist + engine)
COPY --chown=node:node --from=base /deployed ./

USER node

# Expose port
EXPOSE 3000

# Start using absolute path and explicit node binary
CMD ["/usr/local/bin/node", "/app/dist/main.js"]
