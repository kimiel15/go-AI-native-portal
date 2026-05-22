#!/bin/bash
# startup.sh — Azure App Service startup script
# Schema is pushed by GitHub Actions before deployment.
# This script just starts the Next.js standalone server.

echo "[startup] Node: $(node --version)"
echo "[startup] Starting server on port ${PORT:-8080}..."
exec node server.js
