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
    echo 'echo "Starting application..."' >> start.sh && \
    echo 'echo "Running database migrations..."' >> start.sh && \
    echo 'npm run migration:run || echo "Migration failed, continuing..."' >> start.sh && \
    echo 'echo "Starting NestJS application..."' >> start.sh && \
    echo 'npm run start:prod' >> start.sh && \
    chmod +x start.sh

# Start the application with migrations
CMD ["./start.sh"]
