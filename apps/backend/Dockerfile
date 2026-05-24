# Base stage: install dependencies and build the backend
FROM node:22-alpine AS base

# Set environment variables
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_OPTIONS="--max-old-space-size=2048"

RUN corepack enable

# Pre-install essential build tools
RUN mkdir -p /pnpm && chmod -R 777 /pnpm && apk add --no-cache libc6-compat openssl git tar

# Set working directory
WORKDIR /app

# Copy workspace configuration
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY nx.json tsconfig.base.json tsconfig.json eslint.config.mjs ./

# Copy ALL package.json files for workspace discovery
COPY apps/web/package.json ./apps/web/
COPY apps/backend/package.json ./apps/backend/
COPY libs/shared-types/package.json ./libs/shared-types/

# Install ALL dependencies (Needed for Nx build and Prisma)
RUN --mount=type=cache,id=pnpm,target=/pnpm/store,uid=1000,gid=1000,mode=0777 \
    pnpm install --frozen-lockfile

# Copy source code
COPY apps/backend ./apps/backend
COPY libs ./libs

# 1. Generate Prisma Client in the build stage
RUN cd apps/backend && pnpm exec prisma generate

# 2. TAR STRATEGY: Bundle Prisma client resolved files
# We use -L (follow links) to turn pnpm symlinks into real directories
RUN tar -chf /prisma.tar $(find node_modules -name ".prisma" -type d) $(find node_modules -name "@prisma" -type d | grep "client")

# 3. Sync and Build
RUN pnpm exec nx sync --yes && pnpm exec nx build backend --prod

# Production stage
FROM node:22-alpine AS production

ENV NODE_ENV=production

# Critical runtime libraries
RUN apk add --no-cache libc6-compat openssl libgcc libstdc++ findutils tar

WORKDIR /app
RUN chown -R node:node /app

# Copy built application
COPY --chown=node:node --from=base /app/apps/backend/dist ./apps/backend/dist

# CHỦ CHỐT: Extract Prisma client from the tar archive created in base stage
COPY --from=base /prisma.tar /prisma.tar
RUN tar -xf /prisma.tar && rm /prisma.tar

# Tìm file engine và copy ra gốc để bundle nạp được
RUN find /app/node_modules/.prisma -name "libquery_engine-*.so.node" -exec cp {} /app/query-engine.so.node \; && \
    if [ ! -f /app/query-engine.so.node ]; then echo "ERROR: Prisma engine not found!" && exit 1; fi

# Trỏ đích danh vào file đã copy
ENV PRISMA_QUERY_ENGINE_LIBRARY=/app/query-engine.so.node

USER node

# Expose port
EXPOSE 3000

# Start the application directly with node
CMD ["node", "apps/backend/dist/main"]
