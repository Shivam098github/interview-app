import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error("❌ CRITICAL ERROR: DATABASE_URL is NOT set in environment!");
} else {
  console.log("✅ DATABASE_URL detected (length: " + dbUrl.length + ")");
  if (dbUrl.includes("127.0.0.1") || dbUrl.includes("localhost")) {
    console.warn("⚠️ WARNING: DATABASE_URL appears to be pointing to localhost!");
  }
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
  } as any);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
