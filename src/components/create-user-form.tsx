"use client";

import { useActionState } from "react";

import { createUser } from "@/app/actions/users";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <p className="text-sm text-destructive">{messages[0]}</p>;
}

export function CreateUserForm() {
  const [state, action, pending] = useActionState(createUser, undefined);

  return (
    <Card>
      <CardHeader>
        <CardTitle>계정 만들기</CardTitle>
        <CardDescription>
          관리자만 계정을 만들 수 있습니다. 만든 계정의 비밀번호를 사용자에게 전달하세요.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* 성공하면 key가 바뀌어 폼이 초기화된다. */}
        <form
          key={state?.success ? state.message : "form"}
          action={action}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="name">이름</Label>
            <Input id="name" name="name" autoComplete="off" />
            <FieldError messages={state?.errors?.name} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input id="email" name="email" type="email" autoComplete="off" />
            <FieldError messages={state?.errors?.email} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">초기 비밀번호</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
            />
            <FieldError messages={state?.errors?.password} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">권한</Label>
            <select
              id="role"
              name="role"
              defaultValue="USER"
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="USER">일반 사용자</option>
              <option value="ADMIN">관리자</option>
            </select>
            <FieldError messages={state?.errors?.role} />
          </div>

          {state?.message && (
            <Alert variant={state.success ? "default" : "destructive"}>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={pending}>
            {pending ? "만드는 중..." : "계정 만들기"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
