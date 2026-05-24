# Base stage: install dependencies and build the backend
FROM node:22-alpine AS base

# Set environment variables
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_OPTIONS="--max-old-space-size=2048"

RUN corepack enable
RUN apk add --no-cache libc6-compat openssl git

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

# 2. Build the backend
RUN pnpm exec nx sync --yes && pnpm exec nx build backend --prod

# 3. Resolve all symlinks for Prisma to real files (Flattening)
RUN mkdir -p /prisma-real && \
    find node_modules -name ".prisma" -type d -exec cp -rL {} /prisma-real/ \; && \
    find node_modules -name "@prisma" -type d -exec cp -rL {} /prisma-real/ \;

# Production stage
FROM node:22-alpine AS production

ENV NODE_ENV=production

# Critical runtime libraries
RUN apk add --no-cache libc6-compat openssl libgcc libstdc++ findutils

WORKDIR /app
RUN chown -R node:node /app

# 1. Copy only necessary files for production
COPY --chown=node:node apps/backend/package.json ./package.json
COPY --chown=node:node --from=base /app/apps/backend/dist ./dist

# 2. Copy the flattened Prisma modules (NO SYMLINKS)
COPY --chown=node:node --from=base /prisma-real/.prisma ./node_modules/.prisma
COPY --chown=node:node --from=base /prisma-real/@prisma/client ./node_modules/@prisma/client

# 3. Find and co-locate engine
RUN find /app/node_modules -name "libquery_engine-*.so.node" -exec cp {} /app/query-engine.so.node \; && \
    if [ ! -f /app/query-engine.so.node ]; then echo "ERROR: Prisma engine not found!" && exit 1; fi

# Explicitly point to the engine file
ENV PRISMA_QUERY_ENGINE_LIBRARY=/app/query-engine.so.node

USER node

# Expose port
EXPOSE 3000

# Start directly with node to avoid any pnpm issues in runtime
CMD ["node", "dist/main"]
