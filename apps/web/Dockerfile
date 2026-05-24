# STAGE 1: Build
FROM node:22-alpine AS builder
WORKDIR /app

# Accept build arguments
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# ⚠️ CRITICAL FOR NEXT.JS ON ALPINE
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
RUN npx nx sync && npx nx build web --prod

# STAGE 3: Run
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5173

# ⚠️ CRITICAL FOR NEXT.JS ON ALPINE
RUN apk add --no-cache libc6-compat

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy Next.js standalone output
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

USER nextjs

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5173', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

EXPOSE 5173
ENTRYPOINT ["node"]
CMD ["apps/web/server.js"]
