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

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start the application
CMD ["npm", "run", "start:prod"]
