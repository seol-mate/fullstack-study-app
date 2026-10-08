import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL 환경변수가 설정되지 않았습니다.");
  }
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

// 개발 중 HMR로 모듈이 다시 평가되어도 커넥션이 늘어나지 않도록 전역에 보관한다.
export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
