"use client";

import { useSetAtom } from "jotai";
import { useEffect } from "react";

import { userAtom } from "@/atoms/user";
import type { User } from "@/lib/definitions";

// 서버에서 읽은 사용자를 userAtom에 덮어써서 다른 클라이언트 컴포넌트와 공유한다.
// 계정이 바뀌어도 항상 서버 값이 기준이 되도록 매번 갱신한다(useHydrateAtoms는 최초 1회만 채운다).
export function UserCard({ user }: { user: User }) {
  const setUser = useSetAtom(userAtom);

  useEffect(() => {
    setUser(user);
  }, [user, setUser]);

  return (
    <p className="text-muted-foreground">
      {user.name} 님으로 로그인되어 있습니다.
    </p>
  );
}
