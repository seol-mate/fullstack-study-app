"use client";

import { useActionState } from "react";

import { login } from "@/app/actions/auth";
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

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>로그인</CardTitle>
        <CardDescription>데모 계정으로 로그인합니다.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              aria-invalid={!!state?.errors?.email}
            />
            {state?.errors?.email && (
              <p className="text-sm text-destructive">{state.errors.email[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              aria-invalid={!!state?.errors?.password}
            />
            {state?.errors?.password && (
              <p className="text-sm text-destructive">
                {state.errors.password[0]}
              </p>
            )}
          </div>

          {state?.message && (
            <Alert variant="destructive">
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "로그인 중..." : "로그인"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
