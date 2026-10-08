import { Suspense } from "react";

import { CreateUserForm } from "@/components/create-user-form";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export default function AdminUsersPage() {
  return (
    <main className="mx-auto w-full max-w-2xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">계정 관리</h1>
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <AdminUsers />
      </Suspense>
    </main>
  );
}

// 세션과 DB를 읽으므로 Suspense 안에서 요청 시점에 렌더링된다.
async function AdminUsers() {
  await requireAdmin();

  const users = await db.user.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  return (
    <>
      <CreateUserForm />

      <Card>
        <CardHeader>
          <CardTitle>계정 목록</CardTitle>
          <CardDescription>총 {users.length}개</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y">
            {users.map((user) => (
              <li
                key={user.id}
                className="flex items-center justify-between gap-4 py-2 text-sm"
              >
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
                <span className="text-muted-foreground">
                  {user.role === "ADMIN" ? "관리자" : "일반 사용자"}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </>
  );
}
