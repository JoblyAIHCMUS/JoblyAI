# STAGE 1: Build
FROM node:22-alpine AS builder
WORKDIR /app

# Accept build arguments
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# CRITICAL FOR NEXT.JS ON ALPINE
RUN apk add --no-cache libc6-compat 
RUN npm install -g pnpm@10.33.0

# Copy workspace manifests for dependency resolution
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml nx.json tsconfig.base.json tsconfig.json .npmrc ./
COPY eslint.config.mjs .prettierrc .prettierignore ./

# Copy ALL package.json files for workspace discovery BEFORE install
COPY apps/web/package.json ./apps/web/
COPY apps/backend/package.json ./apps/backend/

# Install all dependencies first
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/web ./apps/web

# Build Next.js
ENV CI=true
RUN npx nx sync --yes && npx nx build web --prod && \
    echo "--- Build output structure ---" && \
    ls -R apps/web/.next/standalone | head -n 20


# STAGE 2: Run
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Next.js standalone mặc định chạy cổng 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Cài đặt wget để dùng cho healthcheck (Alpine mặc định có nhưng đảm bảo)
RUN apk add --no-cache libc6-compat wget

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy Next.js standalone output
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

USER nextjs

# Kiểm tra sức khỏe tại cổng 3000 (Sử dụng wget, tăng start_period cho máy t3.medium)
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=5 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/ || exit 1

EXPOSE 3000
ENTRYPOINT ["node"]

# Với Nx, file server.js nằm trong apps/web/server.js của thư mục standalone
CMD ["apps/web/server.js"]