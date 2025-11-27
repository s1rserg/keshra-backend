#!/bin/bash
set -e

# --- Configuration ---
PG_DATA="/var/lib/postgresql/data"
PG_LOG="/var/lib/postgresql/postgres.log"

echo "--- 🐳 Starting All-in-One Container (Alpine) ---"

# 1. Initialize Postgres
if [ ! -d "$PG_DATA" ] || [ -z "$(ls -A "$PG_DATA")" ]; then
    echo "Initializing Postgres Data..."
    mkdir -p "$PG_DATA"
    chown -R postgres:postgres "$PG_DATA"
    
    su-exec postgres initdb -D "$PG_DATA"
    
    echo "host all  all    0.0.0.0/0  trust" >> "$PG_DATA/pg_hba.conf"
    echo "listen_addresses='*'" >> "$PG_DATA/postgresql.conf"
fi

# 2. Start Postgres
echo "Starting Postgres..."
chown -R postgres:postgres "$PG_DATA"
su-exec postgres pg_ctl start -D "$PG_DATA" -l "$PG_LOG"

until su-exec postgres pg_isready; do
  echo "Waiting for Postgres..."
  sleep 1
done

# 3. Setup Database
echo "Configuring Database..."
su-exec postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='${DB_DATABASE}'" | grep -q 1 || su-exec postgres psql -c "CREATE DATABASE \"${DB_DATABASE}\";"
su-exec postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='${DB_USERNAME}'" | grep -q 1 || su-exec postgres psql -c "CREATE USER \"${DB_USERNAME}\" WITH PASSWORD '${DB_PASSWORD}';"
su-exec postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE \"${DB_DATABASE}\" TO \"${DB_USERNAME}\";"
su-exec postgres psql -d "${DB_DATABASE}" -c "GRANT ALL ON SCHEMA public TO \"${DB_USERNAME}\";"

# 4. Start Redis
echo "Starting Redis..."
redis-server --daemonize yes

until redis-cli ping | grep -q PONG; do
  echo "Waiting for Redis..."
  sleep 1
done

# 5. Configure Redis User
if [ -n "$REDIS_DURABLE_USER" ] && [ -n "$REDIS_DURABLE_PASSWORD" ]; then
  echo "Configuring Redis ACL for user: $REDIS_DURABLE_USER"
  # !!! FIX IS HERE: Quotes added around "~*" and "&*" !!!
  redis-cli ACL SETUSER "$REDIS_DURABLE_USER" on ">$REDIS_DURABLE_PASSWORD" "~*" +@all "&*"
fi

# 6. Start NestJS
echo "Starting NestJS Application..."
exec node dist/main.js