# STAGE 1: Build
FROM node:22-alpine AS builder
WORKDIR /app

# Accept build arguments
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# CRITICAL FOR NEXT.JS ON ALPINE
RUN apk add --no-cache libc6-compat 
RUN npm install -g pnpm

# Copy workspace manifests for dependency resolution
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml nx.json tsconfig.base.json tsconfig.json ./
COPY eslint.config.mjs .prettierrc .prettierignore ./

# Copy ALL package.json files for workspace discovery BEFORE install
COPY apps/web/package.json ./apps/web/
COPY apps/backend/package.json ./apps/backend/
COPY libs/shared-types/package.json ./libs/shared-types/

# Install all dependencies first
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/web ./apps/web
COPY libs ./libs

# Build Next.js
ENV CI=true
RUN npx nx sync --yes && npx nx build web --prod && \
    echo "--- Build output structure ---" && \
    ls -R apps/web/.next/standalone | head -n 20


# STAGE 2: Run
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Đổi cổng nội bộ sang 3001 để tránh xung đột cổng 3000 với Backend
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

RUN apk add --no-cache libc6-compat

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy Next.js standalone output
# Next.js standalone output structure:
# .next/standalone/
# ├── server.js
# ├── package.json
# └── apps/web/ (contains node_modules and .next)

# We copy the contents of standalone to /app
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
# Next.js standalone does NOT include static and public folders by default, they must be copied manually
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

USER nextjs

# Cập nhật cổng kiểm tra sức khỏe thành 3001 theo cổng biến môi trường mới
HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

EXPOSE 3001
ENTRYPOINT ["node"]

# In standalone mode, server.js is in the root of the standalone folder
CMD ["apps/web/server.js"]