#!/bin/bash
# startup.sh — Azure App Service startup script
# Runs prisma db push (creates tables), then starts the Next.js server.
# The || true ensures the server always starts even if db push fails.

set -e

echo "[startup] Node: $(node --version)"
echo "[startup] Working dir: $(pwd)"
echo "[startup] Files: $(ls)"

# Sync schema to PostgreSQL (idempotent — safe to run on every cold start)
echo "[startup] Running prisma db push..."
if node node_modules/prisma/build/index.js db push --skip-generate; then
  echo "[startup] DB schema up to date."
else
  echo "[startup] WARNING: prisma db push failed. Server will start anyway."
fi

# Start Next.js standalone server
# Azure sets PORT automatically; Next.js standalone reads it.
echo "[startup] Starting server on port ${PORT:-8080}..."
exec node server.js
