import * as z from "zod";

export const ROLES = ["ADMIN", "USER"] as const;
export type Role = (typeof ROLES)[number];

export const LoginFormSchema = z.object({
  email: z.email({ error: "올바른 이메일을 입력하세요." }).trim().toLowerCase(),
  password: z.string().min(1, { error: "비밀번호를 입력하세요." }),
});

export const CreateUserSchema = z.object({
  name: z.string().trim().min(1, { error: "이름을 입력하세요." }).max(50),
  email: z.email({ error: "올바른 이메일을 입력하세요." }).trim().toLowerCase(),
  password: z
    .string()
    .min(10, { error: "비밀번호는 10자 이상이어야 합니다." })
    .max(72, { error: "비밀번호는 72자 이하여야 합니다." }),
  role: z.enum(ROLES, { error: "권한을 선택하세요." }),
});

export type FormState =
  | {
      errors?: {
        name?: string[];
        email?: string[];
        password?: string[];
        role?: string[];
      };
      message?: string;
      success?: boolean;
    }
  | undefined;

export type SessionPayload = {
  userId: string;
  expiresAt: string;
};

export type User = {
  id: string;
  name: string;
  role: Role;
};
