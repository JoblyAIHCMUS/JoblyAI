# Base stage: install dependencies and build the backend
FROM node:22-alpine AS base

# Set environment variables
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Create pnpm directory with proper permissions BEFORE install
RUN mkdir -p /pnpm && chmod -R 777 /pnpm

# Set working directory
WORKDIR /app

# Copy workspace configuration (consolidate into fewer layers)
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY nx.json tsconfig.base.json tsconfig.json eslint.config.mjs ./

# Copy backend package.json and Prisma schema
COPY apps/backend/package.json ./apps/backend/

# Copy Prisma schema
COPY apps/backend/prisma ./apps/backend/prisma/

# Install dependencies with BuildKit cache mount for dramatic speedup
RUN --mount=type=cache,id=pnpm,target=/pnpm/store,uid=1000,gid=1000,mode=0777 \
    pnpm install --frozen-lockfile

# Note: In pnpm workspaces, if prisma is a dependency of the local project it may need `pnpm exec`
# Create a shortcut binary if not present
RUN pnpm install -g prisma@6.3.0

# Copy backend source code
COPY apps/backend ./apps/backend

# Generate Prisma Client
RUN pnpm --filter @jobly/backend exec prisma generate

# Sync Nx TypeScript project references and build the backend
RUN pnpm exec nx sync --yes
RUN pnpm exec nx build backend

# Development stage (precompile before running dev server)
FROM base AS development
ENV NODE_ENV=development
WORKDIR /app
# Ensure all app contents are owned by node user and tmp is writable
RUN mkdir -p /tmp && chmod -R 777 /tmp && \
    chown -R node:node /app
USER node
# might need to change to start in prod mode depending on use case
CMD ["pnpm", "--filter", "@jobly/backend", "run", "start:dev"]

# Production stage
FROM node:22-alpine AS production

# Keep image lean; only runtime bits
ENV NODE_ENV=production
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable &&  mkdir -p /pnpm && chmod -R 777 /pnpm && \
    mkdir -p /tmp && chmod -R 777 /tmp

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
COPY --chown=node:node --from=base /app/apps/backend/dist ./apps/backend/dist

# Install only backend production dependencies using workspace filter
RUN --mount=type=cache,id=pnpm,target=/pnpm/store,uid=1000,gid=1000,mode=0777 \
    pnpm install --prod --filter @jobly/backend --frozen-lockfile

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "apps/backend/dist/main"]