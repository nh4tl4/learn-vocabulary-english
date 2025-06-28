# Simple Dockerfile for Next.js Frontend
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY apps/frontend/package*.json ./
RUN npm install

# Copy source code
COPY apps/frontend/ ./

# Build the application
RUN npm run build

# Debug: List files to check build output
RUN ls -la
RUN ls -la .next/

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application
CMD ["npm", "start"]
