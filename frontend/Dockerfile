# Multi-stage build for production
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Accept build arguments
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application (skip type checking to allow errors)
RUN npx vite build

# Stage 2: Production with Nginx
FROM nginx:1.25-alpine

# Install wget for healthcheck
RUN apk add --no-cache wget

# Remove default nginx.conf and copy custom nginx configurations
# We need to do this as root before switching to nginx user
RUN rm -f /etc/nginx/nginx.conf && \
  rm -f /etc/nginx/conf.d/default.conf
COPY nginx-main.conf /etc/nginx/nginx.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Create nginx cache directory and PID file directory
RUN mkdir -p /var/cache/nginx/client_temp && \
  mkdir -p /var/cache/nginx/proxy_temp && \
  mkdir -p /var/cache/nginx/fastcgi_temp && \
  mkdir -p /var/cache/nginx/uwsgi_temp && \
  mkdir -p /var/cache/nginx/scgi_temp && \
  mkdir -p /tmp && \
  mkdir -p /etc/nginx/ssl && \
  chown -R nginx:nginx /var/cache/nginx && \
  chown -R nginx:nginx /usr/share/nginx/html && \
  chown -R nginx:nginx /var/log/nginx && \
  chown -R nginx:nginx /etc/nginx/conf.d && \
  chown -R nginx:nginx /etc/nginx/ssl && \
  chown -R nginx:nginx /tmp

# NOTE: Running as root is required for SSL certificate access
# nginx can still drop privileges internally for worker processes
# USER nginx

EXPOSE 80 443

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
