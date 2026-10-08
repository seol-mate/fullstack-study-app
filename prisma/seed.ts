import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

import { PrismaClient } from "../src/generated/prisma/client";

// 첫 관리자 계정을 만든다. 이미 있으면 비밀번호를 덮어쓰지 않고 그대로 둔다.
try {
  process.loadEnvFile(".env.local");
} catch {
  // 셸/CI 환경변수를 사용한다.
}

async function main() {
  const { DATABASE_URL, ADMIN_EMAIL, ADMIN_NAME, ADMIN_PASSWORD } = process.env;

  if (!DATABASE_URL || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error(
      "DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD 환경변수가 필요합니다.",
    );
  }
  if (ADMIN_PASSWORD.length < 10) {
    throw new Error("ADMIN_PASSWORD는 10자 이상이어야 합니다.");
  }

  const db = new PrismaClient({
    adapter: new PrismaPg({ connectionString: DATABASE_URL }),
  });

  try {
    const email = ADMIN_EMAIL.trim().toLowerCase();
    const existing = await db.user.findUnique({ where: { email } });

    if (existing) {
      console.log(`관리자 계정이 이미 있습니다: ${email} (변경 없음)`);
      return;
    }

    await db.user.create({
      data: {
        email,
        name: ADMIN_NAME ?? "관리자",
        passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 12),
        role: "ADMIN",
      },
    });
    console.log(`관리자 계정을 만들었습니다: ${email}`);
  } finally {
    await db.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
