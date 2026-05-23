# Base stage: install dependencies and build the backend
FROM node:22-alpine AS base

# Set environment variables
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
# Increase memory limit for Node.js to prevent OOM during build
ENV NODE_OPTIONS="--max-old-space-size=2048"

RUN corepack enable

# Create pnpm directory with proper permissions BEFORE install
RUN mkdir -p /pnpm && chmod -R 777 /pnpm && apk add --no-cache libc6-compat openssl

# Set working directory
WORKDIR /app

# Copy workspace configuration
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY nx.json tsconfig.base.json tsconfig.json eslint.config.mjs ./

# Copy ALL package.json files for workspace discovery BEFORE install
COPY apps/backend/package.json ./apps/backend/
COPY libs/shared-types/package.json ./libs/shared-types/

# Copy Prisma schema (needed for generate)
COPY apps/backend/prisma ./apps/backend/prisma/

# Install dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store,uid=1000,gid=1000,mode=0777 \
    pnpm install --frozen-lockfile

# Copy backend source code AND root libraries
COPY apps/backend ./apps/backend
COPY libs ./libs

# Generate Prisma Client with explicit binary targets
RUN cd apps/backend && PRISMA_CLI_BINARY_TARGETS=native,linux-musl-openssl-3.0.x pnpm exec prisma generate

# Sync Nx workspace and build the backend
RUN pnpm exec nx sync --yes
RUN pnpm exec nx build backend --prod

# Production stage
FROM node:22-alpine AS production

# Keep image lean; only runtime bits
ENV NODE_ENV=production
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
# Help Prisma find the engine in bundled environment
ENV PRISMA_QUERY_ENGINE_LIBRARY=/app/apps/backend/dist/libquery_engine-linux-musl-openssl-3.0.x.so.node

RUN corepack enable &&  mkdir -p /pnpm && chmod -R 777 /pnpm && \
    mkdir -p /tmp && chmod -R 777 /tmp

# CRITICAL for Prisma on Alpine
RUN apk add --no-cache libc6-compat openssl

# Create app directory
WORKDIR /app

# Ensure app directory is owned by node user
RUN chown -R node:node /app
USER node

# Copy workspace manifests and backend build output
COPY --chown=node:node --from=base /app/package.json ./
COPY --chown=node:node --from=base /app/pnpm-workspace.yaml ./
COPY --chown=node:node --from=base /app/pnpm-lock.yaml ./
COPY --chown=node:node --from=base /app/apps/backend/package.json ./apps/backend/package.json
COPY --chown=node:node --from=base /app/apps/backend/prisma ./apps/backend/prisma

# Correct path for build output based on webpack.config.js
COPY --chown=node:node --from=base /app/apps/backend/dist ./apps/backend/dist

# Install only backend production dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store,uid=1000,gid=1000,mode=0777 \
    pnpm install --prod --filter @jobly/backend --frozen-lockfile

# Regenerate Prisma Client and COPY ENGINE TO DIST
RUN cd apps/backend && PRISMA_CLI_BINARY_TARGETS=native,linux-musl-openssl-3.0.x pnpm exec prisma generate && \
    cp /app/node_modules/.prisma/client/libquery_engine-linux-musl-openssl-3.0.x.so.node /app/apps/backend/dist/

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "apps/backend/dist/main"]
