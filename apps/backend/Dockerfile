# Production-ready multi-stage Dockerfile for NestJS backend
FROM node:20-alpine AS base
WORKDIR /app

# 1. --- Dependencies Stage ---
FROM base AS deps

# Copy root and backend package files
COPY package.json yarn.lock ./
COPY apps/backend/package.json ./apps/backend/

# Install ALL dependencies (including devDependencies for the build)
RUN yarn install --frozen-lockfile

# 2. --- Builder Stage ---
FROM base AS builder

# Copy all dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy the entire source code
COPY . .

# Build the NestJS application
RUN yarn workspace @vocab/backend build

# 3. --- Production/Runner Stage ---
FROM base AS runner

ENV NODE_ENV=production

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copy only production dependencies from the deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./

# Copy backend package.json for migrations and scripts
COPY apps/backend/package.json ./apps/backend/

# Copy the built application from the builder stage
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist

# Copy source files needed for migrations (data-source.ts and migrations)
COPY --from=builder /app/apps/backend/src/data-source.ts ./apps/backend/src/
COPY --from=builder /app/apps/backend/src/database ./apps/backend/src/database

USER nestjs

# Set working directory to the app's root
WORKDIR /app

EXPOSE 3001
ENV PORT 3001

# Start the application
CMD ["node", "apps/backend/dist/main.js"]
