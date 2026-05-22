import { defineConfig } from "prisma/config";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

// prisma.config.ts — used by the Prisma CLI (generate, db push, migrate).
// The PrismaClient itself gets its connection via the @prisma/adapter-pg
// driver adapter passed in lib/prisma.ts.
//
// Prisma CLI only reads `.env` by default. Next.js writes its connection
// string to `.env.local`, so for local CLI commands (`prisma db push`,
// `prisma generate`) we load `.env.local` here when DATABASE_URL is unset.
if (!process.env.DATABASE_URL) {
  const envFile = resolve(process.cwd(), ".env.local");
  if (existsSync(envFile)) {
    for (const line of readFileSync(envFile, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/i);
      if (m && !process.env[m[1]]) {
        // Strip surrounding quotes if present.
        process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, "");
      }
    }
  }
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },
});
