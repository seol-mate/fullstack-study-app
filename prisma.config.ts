import { defineConfig } from "prisma/config";

// Prisma CLI는 .env.local을 자동으로 읽지 않으므로 직접 불러온다.
try {
  process.loadEnvFile(".env.local");
} catch {
  // .env.local이 없으면 셸/CI에 설정된 환경변수를 사용한다.
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
