import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const dbUrl = process.env.DATABASE_URL;

if (dbUrl) {
  console.log("✅ DATABASE_URL detected. Initializing Prisma client...");
}

export const prisma =
  globalForPrisma.prisma ??
  new (PrismaClient as any)({
    datasourceUrl: process.env.DATABASE_URL || process.env.DIRECT_URL,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
