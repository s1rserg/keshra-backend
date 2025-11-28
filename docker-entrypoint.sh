#!/bin/bash
set -e

echo "--- 🚀 Starting Hybrid Container (Redis Internal / DB External) ---"

# 1. Start Redis
echo "Starting Redis..."
redis-server --daemonize yes

until redis-cli ping | grep -q PONG; do
  echo "Waiting for Redis to accept connections..."
  sleep 1
done
echo "Redis is UP!"

# 2. Configure Redis User
if [ -n "$REDIS_DURABLE_USER" ] && [ -n "$REDIS_DURABLE_PASSWORD" ]; then
  echo "Configuring Redis ACL for user: $REDIS_DURABLE_USER"
  
  # 👇 FIX IS HERE: Added "&*" to grant permission to all Pub/Sub channels
  redis-cli ACL SETUSER "$REDIS_DURABLE_USER" on ">$REDIS_DURABLE_PASSWORD" ~* +@all "&*"
fi

# 3. Start NestJS
echo "Starting NestJS..."
exec node dist/main.js