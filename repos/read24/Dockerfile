# syntax=docker/dockerfile:1.6

# ============================================
# Stage 1: deps — install with native module build tools (argon2)
# ============================================
FROM node:20-alpine AS deps
RUN apk add --no-cache python3 make g++ libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ============================================
# Stage 2: builder — build Next.js standalone
# ============================================
FROM node:20-alpine AS builder
WORKDIR /app
# Placeholder envs — required because route modules instantiate clients at import time.
# Real values come from Secret Manager at runtime.
ENV NEXT_TELEMETRY_DISABLED=1 \
    MONGODB_URI=mongodb+srv://build:build@build.mongodb.net/build \
    JWT_SECRET=build-placeholder-secret \
    REFRESH_TOKEN_SECRET=build-placeholder-refresh \
    MINIO_ENDPOINT=storage.googleapis.com \
    MINIO_PORT=443 \
    MINIO_USE_SSL=true \
    MINIO_ACCESS_KEY=build-placeholder \
    MINIO_SECRET_KEY=build-placeholder \
    MINIO_BUCKET=build-placeholder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ============================================
# Stage 3: runner — minimal runtime image
# ============================================
FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache libc6-compat
ENV NODE_ENV=production \
    PORT=8080 \
    HOSTNAME=0.0.0.0 \
    NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 8080
CMD ["node", "server.js"]
