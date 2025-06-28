# Simple Dockerfile for NestJS Backend
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY apps/backend/package*.json ./
RUN npm install

# Copy source code
COPY apps/backend/ ./

# Build the application
RUN npm run build

# Expose port (Render uses PORT env variable, usually 10000)
EXPOSE 10000

# Set environment variables
ENV NODE_ENV=production

# Create a startup script that runs migrations then starts the app
RUN echo '#!/bin/sh' > start.sh && \
    echo 'set -e' >> start.sh && \
    echo 'echo "=== Starting Vocabulary Backend ==="' >> start.sh && \
    echo 'echo "Environment: $NODE_ENV"' >> start.sh && \
    echo 'echo "Database Host: $DB_HOST"' >> start.sh && \
    echo 'echo "=== Running Database Migrations ==="' >> start.sh && \
    echo 'npx typeorm-ts-node-commonjs -d data-source.ts migration:run' >> start.sh && \
    echo 'echo "=== Migrations Complete ==="' >> start.sh && \
    echo 'echo "=== Starting NestJS Application ==="' >> start.sh && \
    echo 'npm run start:prod' >> start.sh && \
    chmod +x start.sh

# Start the application with migrations
CMD ["./start.sh"]
