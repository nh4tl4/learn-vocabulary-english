# Optimized Multi-stage build for NestJS Backend
FROM node:18-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Dependencies stage - cache this layer
FROM base AS deps
COPY apps/backend/package*.json ./
# Use npm cache mount for faster installs (fallback for Render)
RUN npm ci --only=production || npm install --only=production

# Build stage - cache dependencies separately
FROM base AS builder
COPY apps/backend/package*.json ./
RUN npm ci || npm install

# Copy source code (this layer changes most often)
COPY apps/backend/ .

# Build application
RUN npm run build

# Production stage - minimal final image
FROM node:18-alpine AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

# Copy only necessary files
COPY --from=deps --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./

USER nestjs
EXPOSE 3000
ENV NODE_ENV=production
ENV PORT=3000

CMD ["node", "dist/main.js"]
