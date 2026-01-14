FROM node:22-alpine AS base

# Keep Nx daemon off in containers and install pnpm
ENV NX_DAEMON=false
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy workspace configuration
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY pnpm-lock.yaml ./
COPY nx.json ./
COPY tsconfig.base.json ./
COPY tsconfig.json ./

# Copy backend package.json
COPY apps/backend/package.json ./apps/backend/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy backend source code
COPY apps/backend ./apps/backend

# Sync Nx TypeScript project references and build the backend
RUN pnpm exec nx sync --yes
RUN pnpm exec nx build backend

# Production stage
FROM node:22-alpine AS production

# Keep image lean; only runtime bits
ENV NODE_ENV=production
ENV NX_DAEMON=false

# Create app directory
WORKDIR /app

# Copy workspace manifests and backend build output
COPY --from=base /app/package.json ./
COPY --from=base /app/pnpm-workspace.yaml ./
COPY --from=base /app/pnpm-lock.yaml ./
COPY --from=base /app/apps/backend/package.json ./apps/backend/package.json
COPY --from=base /app/apps/backend/dist ./apps/backend/dist

# Install only backend production dependencies using workspace filter
RUN pnpm install --prod --filter @jobly/backend --frozen-lockfile

# Expose port
EXPOSE 3000

# Start the application
WORKDIR /app/apps/backend
CMD ["node", "dist/main"]
