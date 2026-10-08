import Link from "next/link";
import { Suspense } from "react";

import { logout } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UserCard } from "@/components/user-card";
import { getCurrentUser } from "@/lib/auth";

export default function DashboardPage() {
  return (
    <main className="mx-auto w-full max-w-2xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">대시보드</h1>
      <Suspense fallback={<Skeleton className="h-16 w-full" />}>
        <Profile />
      </Suspense>
    </main>
  );
}

// 세션(쿠키)을 읽는 컴포넌트는 Suspense 안에서 요청 시점에 렌더링된다.
async function Profile() {
  const user = await getCurrentUser();

  return (
    <div className="flex items-center justify-between gap-4">
      <UserCard user={user} />
      <div className="flex items-center gap-2">
        {user.role === "ADMIN" && (
          <Button
            variant="secondary"
            nativeButton={false}
            render={<Link href="/admin/users" />}
          >
            계정 관리
          </Button>
        )}
        <form action={logout}>
          <Button type="submit" variant="outline">
            로그아웃
          </Button>
        </form>
      </div>
    </div>
  );
}
