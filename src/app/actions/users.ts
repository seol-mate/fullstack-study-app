"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import * as z from "zod";

import { Prisma } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/auth";
import { CreateUserSchema, type FormState } from "@/lib/definitions";
import { db } from "@/lib/db";

export async function createUser(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  // Server Action은 직접 호출될 수 있으므로 페이지 보호와 별개로 여기서도 관리자인지 확인한다.
  await requireAdmin();

  const parsed = CreateUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors };
  }

  const { name, email, password, role } = parsed.data;
  const passwordHash = await bcrypt.hash(password, 12);

  try {
    await db.user.create({ data: { name, email, passwordHash, role } });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { errors: { email: ["이미 등록된 이메일입니다."] } };
    }
    throw error;
  }

  revalidatePath("/admin/users");
  return { success: true, message: `${name} 계정을 만들었습니다.` };
}
