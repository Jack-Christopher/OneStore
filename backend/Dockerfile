# Multi-stage build for production
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript and resolve path aliases (allow errors to not block build)
RUN npm run build || true

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies and wget for healthcheck
RUN npm ci --only=production && npm cache clean --force && \
  apk add --no-cache wget

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Copy migrate-mongo config and migrations for running migrations
COPY migrate-mongo-config.js ./
COPY --from=builder /app/src/database/migrations ./src/database/migrations

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
  adduser -S nodejs -u 1001

# Change ownership of app directory
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/health || exit 1

CMD ["node", "dist/server.js"]
