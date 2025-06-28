# Debug Dockerfile for NestJS Backend
FROM node:18-alpine

WORKDIR /app

# Install dependencies first
COPY apps/backend/package*.json ./
RUN npm install

# Copy source code
COPY apps/backend/ ./

# Debug: Check what files we have before build
RUN echo "Files before build:" && ls -la
RUN echo "Source files:" && ls -la src/

# Build the application
RUN npm run build

# Debug: Check build output
RUN echo "Files after build:" && ls -la
RUN echo "Dist directory contents:" && ls -la dist/ || echo "No dist directory found"

# Check if main.js exists
RUN test -f dist/main.js && echo "main.js found!" || echo "main.js NOT found!"

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Use alternative start method if main.js doesn't exist
CMD ["sh", "-c", "if [ -f dist/main.js ]; then node dist/main.js; else npm run start; fi"]
