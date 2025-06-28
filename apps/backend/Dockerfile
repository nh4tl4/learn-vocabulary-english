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

# Start the application
CMD ["npm", "run", "start:prod"]
