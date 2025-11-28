#!/bin/bash
set -e

echo "--- 🚀 Starting Hybrid Container (Redis Internal / DB External) ---"

# 1. Start Redis
echo "Starting Redis..."
# We run as the default root user of the container for simplicity in this setup,
# or you can use 'su-exec redis redis-server...' if you want to be strict.
redis-server --daemonize yes

# Wait for Redis to be ready
until redis-cli ping | grep -q PONG; do
  echo "Waiting for Redis to accept connections..."
  sleep 1
done
echo "Redis is UP!"

# 2. Start NestJS
# The app will connect to localhost:6379 for Redis
# But it should connect to a REMOTE URL for Postgres
echo "Starting NestJS..."
exec node dist/main.js