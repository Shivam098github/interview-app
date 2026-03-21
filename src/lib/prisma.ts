import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.warn("⚠️ WARNING: DATABASE_URL is NOT set. Database features will fail at runtime.");
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient(
    (dbUrl ? { datasourceUrl: dbUrl } : {}) as any
  );

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
