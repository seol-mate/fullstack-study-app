// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

// next/navigation의 redirect는 항상 throw 하므로 동일하게 흉내 낸다.
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

vi.mock("@/lib/session", () => ({ getSession: vi.fn() }));
vi.mock("@/lib/db", () => ({
  db: { user: { findUnique: vi.fn() } },
}));

import { db } from "@/lib/db";
import { getCurrentUser, requireAdmin } from "@/lib/auth";
import { getSession } from "@/lib/session";

const mockGetSession = vi.mocked(getSession);
const mockFindUnique = vi.mocked(db.user.findUnique);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getCurrentUser", () => {
  it("세션이 없으면 /login 으로 redirect", async () => {
    mockGetSession.mockResolvedValue(undefined);
    await expect(getCurrentUser()).rejects.toThrow("REDIRECT:/login");
    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  it("DB에 사용자가 없으면 /login 으로 redirect", async () => {
    mockGetSession.mockResolvedValue({ userId: "u1", expiresAt: "" });
    mockFindUnique.mockResolvedValue(null as never);
    await expect(getCurrentUser()).rejects.toThrow("REDIRECT:/login");
  });

  it("필요한 필드만 select 하여 사용자를 돌려준다", async () => {
    const user = { id: "u1", name: "홍길동", role: "USER" };
    mockGetSession.mockResolvedValue({ userId: "u1", expiresAt: "" });
    mockFindUnique.mockResolvedValue(user as never);

    await expect(getCurrentUser()).resolves.toEqual(user);
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { id: "u1" },
      select: { id: true, name: true, role: true },
    });
  });
});

describe("requireAdmin", () => {
  beforeEach(() => {
    mockGetSession.mockResolvedValue({ userId: "u1", expiresAt: "" });
  });

  it("ADMIN이면 사용자를 돌려준다", async () => {
    const admin = { id: "u1", name: "관리자", role: "ADMIN" };
    mockFindUnique.mockResolvedValue(admin as never);
    await expect(requireAdmin()).resolves.toEqual(admin);
  });

  it("ADMIN이 아니면 /dashboard 로 redirect", async () => {
    mockFindUnique.mockResolvedValue({ id: "u1", name: "일반", role: "USER" } as never);
    await expect(requireAdmin()).rejects.toThrow("REDIRECT:/dashboard");
  });
});
