"use client";

import { useAtomValue } from "jotai";
import { useHydrateAtoms } from "jotai/utils";

import { userAtom } from "@/atoms/user";
import type { User } from "@/lib/definitions";

// 서버에서 읽은 사용자를 userAtom에 채우고, atom 값으로 렌더링한다.
export function UserCard({ user }: { user: User }) {
  useHydrateAtoms([[userAtom, user]]);
  const current = useAtomValue(userAtom);

  return (
    <p className="text-muted-foreground">
      {current?.name} 님으로 로그인되어 있습니다.
    </p>
  );
}
