FROM node:22-alpine AS base

# Keep Nx daemon off in containers and install pnpm, # development for now
ENV NODE_ENV=development
ENV NX_DAEMON=false
# Install pnpm, Git (Nx), and OpenSSL (Required for Prisma Engine)
RUN npm install -g pnpm && apk add --no-cache openssl git

# Set working directory
WORKDIR /app

# Copy workspace configuration
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY apps/backend/.npmrc ./.npmrc
COPY pnpm-lock.yaml ./
COPY nx.json ./
COPY tsconfig.base.json ./
COPY tsconfig.json ./

# Copy backend package.json
COPY apps/backend/package.json ./apps/backend/

# Install dependencies
RUN pnpm install --frozen-lockfile
RUN pnpm rebuild

# Copy backend source code
COPY apps/backend ./apps/backend

# Sync Nx TypeScript project references, generate Prisma client, and build the backend
RUN pnpm exec nx sync --yes
RUN pnpm --filter @jobly/backend exec prisma generate --schema prisma/schema.prisma
RUN pnpm exec nx build backend

# Development stage (precompile before running dev server)
FROM base AS development
ENV NODE_ENV=development
WORKDIR /app
CMD ["sh", "-c", "pnpm install --frozen-lockfile && pnpm rebuild && cd apps/backend && pnpm exec prisma generate --schema prisma/schema.prisma && cd /app && pnpm exec nx run @jobly/backend:start:dev"]

# Production stage
FROM node:22-alpine AS production
RUN npm install -g pnpm && apk add --no-cache openssl libc6-compat

# Keep image lean; only runtime bits
ENV NODE_ENV=production
ENV NX_DAEMON=false
ENV CI=true

# Create app directory
WORKDIR /app

# Copy workspace manifests and backend build output
COPY --from=base /app/package.json ./
COPY --from=base /app/.npmrc ./
COPY --from=base /app/pnpm-workspace.yaml ./
COPY --from=base /app/pnpm-lock.yaml ./
COPY --from=base /app/apps/backend/package.json ./apps/backend/package.json
COPY --from=base /app/apps/backend/dist ./apps/backend/dist
COPY --from=base /app/apps/backend/prisma ./apps/backend/prisma

RUN pnpm install --filter @jobly/backend --frozen-lockfile
RUN pnpm rebuild --filter @jobly/backend
# Generate Prisma client
WORKDIR /app/apps/backend
RUN pnpm exec prisma generate --schema prisma/schema.prisma
WORKDIR /app
RUN pnpm prune --prod

# Expose port
EXPOSE 3000

# Start the application
WORKDIR /app/apps/backend
CMD ["node", "dist/main"]