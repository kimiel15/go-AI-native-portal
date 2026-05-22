// Fail-fast env validation. Runs at runtime only — skipped during `next build`
// because Azure GitHub Actions doesn't have App Service env vars at build time,
// and the build doesn't actually need them.
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';

if (!isBuildPhase) {
  const required = ['ADMIN_PASSWORD', 'AUTH_SECRET', 'DATABASE_URL'] as const;
  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }
}

export {};
