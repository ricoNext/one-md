import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const normalizeDatabaseUrl = (
  rawUrl: string | undefined
): string | undefined => {
  if (!rawUrl) {
    return undefined;
  }

  if (rawUrl.includes("sslmode=require")) {
    return rawUrl.replace("sslmode=require", "sslmode=disable");
  }

  if (rawUrl.includes("sslmode=")) {
    return rawUrl;
  }

  const separator = rawUrl.includes("?") ? "&" : "?";
  return `${rawUrl}${separator}sslmode=disable`;
};

const databaseUrl = normalizeDatabaseUrl(process.env.DATABASE_URL);
const adapter = databaseUrl ? new PrismaPg(databaseUrl) : undefined;

const createPrismaClient = () =>
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

/** Dev HMR 可能留下旧的 PrismaClient（缺少新模型的 delegate）。 */
const isStaleDevClient = (client: PrismaClient | undefined): boolean => {
  if (process.env.NODE_ENV === "production" || !client) {
    return false;
  }
  return typeof client.user?.findUnique !== "function";
};

const getPrisma = (): PrismaClient => {
  if (isStaleDevClient(globalForPrisma.prisma)) {
    const stale = globalForPrisma.prisma;
    globalForPrisma.prisma = undefined;
    stale?.$disconnect().catch(() => {
      // ignore disconnect errors during HMR refresh
    });
  }

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }

  return globalForPrisma.prisma;
};

/**
 * 通过 Proxy 转发到当前 client，并对顶层函数做 bind，避免 `this` 指向错误
 *（例如 `prisma.$transaction` 在 Proxy 上调用会坏）。
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, _receiver) {
    const client = getPrisma();
    const value = Reflect.get(client, prop, client);
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});
