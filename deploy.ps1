#!/usr/bin/env pwsh
# deploy.ps1 — Build and zip-deploy the portal to Azure App Service
# Usage: .\deploy.ps1
# Requires: Node 20+, Azure CLI (az) logged in to the correct subscription

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# ── Config ────────────────────────────────────────────────────────────────────
$APP_NAME      = "go-ai-native-portal"
$RESOURCE_GROUP = "go-ai-native-rg"
$DB_URL        = $env:DATABASE_URL  # must be set in your shell before running

if (-not $DB_URL) {
    Write-Error "DATABASE_URL env var is not set. Set it before running this script."
    exit 1
}

# ── 1. Build ─────────────────────────────────────────────────────────────────
Write-Host "`n==> Installing dependencies..." -ForegroundColor Cyan
npm ci

Write-Host "`n==> Building (prisma generate + next build)..." -ForegroundColor Cyan
$env:DATABASE_URL = $DB_URL
npm run build

# ── 2. Assemble standalone package ───────────────────────────────────────────
# next build with output:'standalone' produces .next/standalone/ which is
# self-contained (includes trimmed node_modules).  We just need to copy in
# the static assets and prisma migrations folder.

Write-Host "`n==> Assembling deployment package..." -ForegroundColor Cyan
$STAGE = ".\deploy-stage"

if (Test-Path $STAGE) { Remove-Item $STAGE -Recurse -Force }
New-Item -ItemType Directory $STAGE | Out-Null

# Copy standalone server
Copy-Item ".\.next\standalone\*" $STAGE -Recurse

# Static assets (CSS, JS chunks, images)
$staticDest = "$STAGE\.next\static"
if (-not (Test-Path $staticDest)) { New-Item -ItemType Directory $staticDest | Out-Null }
Copy-Item ".\.next\static\*" $staticDest -Recurse

# Public folder
if (Test-Path ".\public") {
    Copy-Item ".\public" "$STAGE\public" -Recurse
}

# Prisma schema + migrations (needed for db push at startup)
Copy-Item ".\prisma" "$STAGE\prisma" -Recurse

# ── 3. Zip ───────────────────────────────────────────────────────────────────
$ZIP = ".\portal-deploy.zip"
if (Test-Path $ZIP) { Remove-Item $ZIP -Force }

Write-Host "`n==> Creating $ZIP ..." -ForegroundColor Cyan
Compress-Archive -Path "$STAGE\*" -DestinationPath $ZIP

# ── 4. Update App Service settings (idempotent) ───────────────────────────────
Write-Host "`n==> Configuring App Service settings..." -ForegroundColor Cyan

# Tell Azure NOT to re-build — we ship a pre-built standalone bundle
az webapp config appsettings set `
    --name $APP_NAME `
    --resource-group $RESOURCE_GROUP `
    --settings SCM_DO_BUILD_DURING_DEPLOYMENT=false | Out-Null

az webapp config set `
    --name $APP_NAME `
    --resource-group $RESOURCE_GROUP `
    --startup-file "node_modules/.bin/prisma db push && node server.js"

# ── 5. Deploy ─────────────────────────────────────────────────────────────────
Write-Host "`n==> Deploying to $APP_NAME ..." -ForegroundColor Cyan
az webapp deploy `
    --name $APP_NAME `
    --resource-group $RESOURCE_GROUP `
    --src-path $ZIP `
    --type zip `
    --async false

# ── 6. Cleanup ────────────────────────────────────────────────────────────────
Remove-Item $STAGE -Recurse -Force
Remove-Item $ZIP   -Force

Write-Host "`n==> Done! Visit: https://$APP_NAME.azurewebsites.net" -ForegroundColor Green
Write-Host "    (App may take 30–60 s to cold-start after first deploy)" -ForegroundColor Yellow
