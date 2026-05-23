# Base stage: install dependencies and build the backend
FROM node:22-alpine AS base

# Set environment variables
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
# Increase memory limit for Node.js to prevent OOM during build
ENV NODE_OPTIONS="--max-old-space-size=2048"

RUN corepack enable

# Create pnpm directory with proper permissions BEFORE install
RUN mkdir -p /pnpm && chmod -R 777 /pnpm

# Set working directory
WORKDIR /app

# Copy workspace configuration
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY nx.json tsconfig.base.json tsconfig.json eslint.config.mjs ./

# Copy backend package.json and Prisma schema
COPY apps/backend/package.json ./apps/backend/
COPY apps/backend/prisma ./apps/backend/prisma/

# Install dependencies (installs everything including devDeps for build)
RUN --mount=type=cache,id=pnpm,target=/pnpm/store,uid=1000,gid=1000,mode=0777 \
    pnpm install --frozen-lockfile

# Copy backend source code AND root libraries
# Note: Root folder is 'libs' (plural) containing shared-types, 
# while backend internal folder is 'apps/backend/src/lib' (singular).
COPY apps/backend ./apps/backend
COPY libs ./libs

# Generate Prisma Client (running from the backend directory to ensure paths are correct)
RUN cd apps/backend && npx prisma generate

# Sync Nx workspace and build the backend
RUN pnpm exec nx sync --yes
RUN pnpm exec nx build backend --prod

# Production stage
FROM node:22-alpine AS production

# Keep image lean; only runtime bits
ENV NODE_ENV=production
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
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

# Regenerate Prisma Client in production environment
RUN cd apps/backend && npx prisma generate

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "apps/backend/dist/main"]
