# ============================
# Stage 1: Builder
# ============================
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ============================
# Stage 2: Runner (Production)
# ============================
FROM node:20-alpine

# 1. Install Redis only (and bash/su-exec if you prefer, but not strictly needed for just Redis)
RUN apk add --no-cache redis bash

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

# 2. Copy the simplified entrypoint
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["docker-entrypoint.sh"]