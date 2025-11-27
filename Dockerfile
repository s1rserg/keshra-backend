# ============================
# Stage 1: Builder
# ============================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev) to build the app
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# ============================
# Stage 2: Runner (Production)
# ============================
FROM node:20-alpine

# Install Postgres, Redis, and bash (for the script)
RUN apk add --no-cache \
    postgresql \
    postgresql-contrib \
    redis \
    bash \
    su-exec

# Create the Postgres run directory (required for Alpine)
RUN mkdir -p /run/postgresql && chown -R postgres:postgres /run/postgresql

# Set working directory
WORKDIR /app

# Copy package.json for production install
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy built assets from the Builder stage
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Copy and setup entrypoint
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]