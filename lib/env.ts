const required = ['ADMIN_PASSWORD', 'AUTH_SECRET', 'DATABASE_URL'] as const;

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export {};
