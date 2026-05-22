#!/bin/bash
# startup.sh — Azure App Service startup script
# Runs prisma db push (creates tables), then starts the Next.js server.

set -e

echo "[startup] Node: $(node --version)"
echo "[startup] Working dir: $(pwd)"
echo "[startup] node_modules/prisma present: $(test -d node_modules/prisma && echo YES || echo NO)"

# Sync schema to PostgreSQL (idempotent — safe to run on every cold start)
echo "[startup] Running prisma db push..."
if node node_modules/prisma/build/index.js db push --skip-generate 2>&1; then
  echo "[startup] DB schema up to date."
else
  echo "[startup] ERROR: prisma db push failed (exit $?). Check DATABASE_URL and network. Server will start but DB tables may be missing."
fi

# Start Next.js standalone server
# Azure sets PORT automatically; Next.js standalone reads it.
echo "[startup] Starting server on port ${PORT:-8080}..."
exec node server.js
