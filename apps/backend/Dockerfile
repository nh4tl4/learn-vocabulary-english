# Dockerfile for NestJS Backend with detailed debugging
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY apps/backend/package*.json ./
RUN npm install

# Copy source code
COPY apps/backend/ ./

# Debug: Show what we have before build
RUN echo "=== Before Build ===" && \
    echo "Working directory:" && pwd && \
    echo "Files in root:" && ls -la && \
    echo "Source files:" && ls -la src/ && \
    echo "Package.json scripts:" && cat package.json | grep -A5 -B5 "scripts"

# Build the application with verbose output
RUN echo "=== Starting Build ===" && \
    npm run build && \
    echo "=== Build Complete ==="

# Debug: Show what we have after build
RUN echo "=== After Build ===" && \
    echo "Files in root:" && ls -la && \
    echo "Dist directory:" && ls -la dist/ && \
    echo "Main.js check:" && (test -f dist/main.js && echo "main.js EXISTS" || echo "main.js MISSING") && \
    echo "All dist files:" && find dist/ -name "*.js" 2>/dev/null || echo "No JS files in dist"

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Use a more robust start command
CMD ["sh", "-c", "echo 'Starting application...' && ls -la dist/ && npm run start:prod"]
