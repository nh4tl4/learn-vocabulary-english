# Multi-stage build for NestJS Backend
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY apps/backend/package*.json ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY apps/backend/package*.json ./
RUN npm ci

# Copy source code
COPY apps/backend/ .

# Build the application
RUN npm run build

# Production image, copy all the files and run nest
FROM base AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copy built application
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./

# Copy data-source configuration
COPY --from=builder --chown=nestjs:nodejs /app/data-source.ts ./

USER nestjs

EXPOSE 3000

ENV NODE_ENV production

# Start the server using the production build
CMD ["node", "dist/main.js"]
