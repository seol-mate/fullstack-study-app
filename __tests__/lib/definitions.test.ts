// @vitest-environment node
import { describe, expect, it } from "vitest";

import { CreateUserSchema, LoginFormSchema } from "@/lib/definitions";

describe("LoginFormSchema", () => {
  it("이메일을 소문자로 정규화한다", () => {
    const result = LoginFormSchema.safeParse({
      email: "Admin@Example.COM",
      password: "pw",
    });
    expect(result.success).toBe(true);
    expect(result.data?.email).toBe("admin@example.com");
  });

  // z.email()이 trim()보다 먼저 검증되므로 앞뒤 공백이 있으면 거부된다.
  it("앞뒤 공백이 있는 이메일은 거부한다", () => {
    const result = LoginFormSchema.safeParse({ email: " a@b.com ", password: "pw" });
    expect(result.success).toBe(false);
  });

  it("잘못된 이메일은 에러 메시지를 돌려준다", () => {
    const result = LoginFormSchema.safeParse({ email: "nope", password: "pw" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("올바른 이메일을 입력하세요.");
  });

  it("빈 비밀번호는 거부한다", () => {
    const result = LoginFormSchema.safeParse({ email: "a@b.com", password: "" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("비밀번호를 입력하세요.");
  });
});

describe("CreateUserSchema", () => {
  const valid = {
    name: "홍길동",
    email: "user@example.com",
    password: "a".repeat(10),
    role: "USER",
  };

  it("올바른 입력은 통과한다", () => {
    expect(CreateUserSchema.safeParse(valid).success).toBe(true);
  });

  it("이름은 trim 되며 비어 있으면 거부한다", () => {
    expect(CreateUserSchema.parse({ ...valid, name: "  길동  " }).name).toBe("길동");
    expect(CreateUserSchema.safeParse({ ...valid, name: "   " }).success).toBe(false);
  });

  it("이름은 50자까지만 허용한다", () => {
    expect(CreateUserSchema.safeParse({ ...valid, name: "a".repeat(50) }).success).toBe(true);
    expect(CreateUserSchema.safeParse({ ...valid, name: "a".repeat(51) }).success).toBe(false);
  });

  it("비밀번호는 10~72자만 허용한다", () => {
    expect(CreateUserSchema.safeParse({ ...valid, password: "a".repeat(9) }).success).toBe(false);
    expect(CreateUserSchema.safeParse({ ...valid, password: "a".repeat(72) }).success).toBe(true);
    expect(CreateUserSchema.safeParse({ ...valid, password: "a".repeat(73) }).success).toBe(false);
  });

  it("role은 ADMIN/USER만 허용한다", () => {
    expect(CreateUserSchema.safeParse({ ...valid, role: "ADMIN" }).success).toBe(true);
    const result = CreateUserSchema.safeParse({ ...valid, role: "ROOT" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe("권한을 선택하세요.");
  });
});
