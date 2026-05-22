import { defineConfig } from "prisma/config";

// prisma.config.ts — used by the Prisma CLI (generate, db push, migrate).
// The PrismaClient itself gets its connection via the @prisma/adapter-pg
// driver adapter passed in lib/prisma.ts.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },
});
