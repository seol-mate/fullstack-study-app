import "server-only";

import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import type { User } from "@/lib/definitions";
import { getSession } from "@/lib/session";

// 세션의 userId로 DB를 조회해 현재 사용자를 돌려준다. 클라이언트에는 필요한 필드만 노출한다.
// 권한(role)은 토큰이 아니라 항상 DB 값을 기준으로 한다.
export async function getCurrentUser(): Promise<User> {
  const session = await getSession();
  if (!session?.userId) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, role: true },
  });
  if (!user) redirect("/login");

  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await getCurrentUser();
  if (user.role !== "ADMIN") redirect("/dashboard");

  return user;
}
