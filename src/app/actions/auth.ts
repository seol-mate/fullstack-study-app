"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import * as z from "zod";

import { db } from "@/lib/db";
import { type FormState, LoginFormSchema } from "@/lib/definitions";
import { createSession, deleteSession } from "@/lib/session";

// 없는 이메일이어도 같은 비용의 해시 비교를 하도록 쓰는 더미 해시(응답 시간으로 계정 존재 여부가 드러나지 않게 한다).
let dummyHash: string | undefined;

export async function login(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = LoginFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors };
  }

  const { email, password } = parsed.data;
  const user = await db.user.findUnique({ where: { email } });

  dummyHash ??= await bcrypt.hash("dummy-password", 12);
  const passwordOk = await bcrypt.compare(
    password,
    user?.passwordHash ?? dummyHash,
  );

  if (!user || !passwordOk) {
    return { message: "이메일 또는 비밀번호가 올바르지 않습니다." };
  }

  await createSession(user.id);
  redirect("/dashboard");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
