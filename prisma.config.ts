// Prisma config for the Kaizen monorepo (web app database).
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "apps/web/prisma/schema.prisma",
  migrations: {
    path: "apps/web/prisma/migrations",
    seed: "tsx apps/web/prisma/seed.ts",
  },
  datasource: { url: process.env["DATABASE_URL"] },
});
