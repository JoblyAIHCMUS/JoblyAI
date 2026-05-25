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
RUN cd apps/backend && PRISMA_CLI_BINARY_TARGETS=linux-musl-openssl-3.0.x pnpm exec prisma generate

# 2. Sync and Build
RUN pnpm exec nx sync --yes && pnpm exec nx build backend --prod

# 3. PNPM DEPLOY
RUN pnpm --filter @jobly/backend deploy --prod --legacy /deployed && \
    cp -r apps/backend/dist /deployed/dist && \
    cp -r apps/backend/prisma /deployed/prisma

# 4. Final Prisma setup inside the deployed folder
RUN cd /deployed && \
    PRISMA_CLI_BINARY_TARGETS=linux-musl-openssl-3.0.x npx prisma generate && \
    # Copy engine directly into dist folder where main.js lives
    find node_modules -name "libquery_engine-*.so.node" -exec cp {} /deployed/dist/query-engine.so.node \;

RUN chown -R node:node /deployed


# Production stage
FROM node:22-alpine AS production

ENV NODE_ENV=production
# Force Prisma to use the engine we placed in the dist folder
ENV PRISMA_QUERY_ENGINE_LIBRARY=/app/dist/query-engine.so.node
ENV PRISMA_CLI_BINARY_TARGETS=linux-musl-openssl-3.0.x

# Critical runtime libraries for Alpine
RUN apk add --no-cache libc6-compat openssl libgcc libstdc++ findutils curl

RUN npm install -g pnpm

WORKDIR /app

# Copy the entire deployed folder với quyền chuẩn node
COPY --chown=node:node --from=base /deployed ./

USER node

# Healthcheck inside container
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://127.0.0.1:3000/api || exit 1

EXPOSE 3000

# Start bằng Node thuần
CMD ["node", "dist/main.js"]