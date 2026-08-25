import "server-only";

import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/generated/prisma/client";
import { config } from "@/config";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * 返回 Prisma Client 单例。
 * 每个进程只应持有一个实例，避免连接池耗尽。
 */
function createPrismaClient(): PrismaClient {
  const adapter = new PrismaMariaDb(config.databaseUrl);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (!config.isProduction) {
  globalForPrisma.prisma = prisma;
}
