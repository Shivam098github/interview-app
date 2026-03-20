import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Load .env.local first (takes priority), then .env as fallback
config({ path: ".env.local" });
config({ path: ".env" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Use direct (non-pooled) connection for migrations
    url: process.env["DIRECT_URL"],
  },
});
