// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const cookieStore = {
  set: vi.fn(),
  delete: vi.fn(),
  get: vi.fn(),
};
vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => cookieStore),
}));

import {
  SESSION_COOKIE,
  createSession,
  decrypt,
  deleteSession,
  encrypt,
  getSession,
} from "@/lib/session";

const payload = { userId: "u1", expiresAt: "2030-01-01T00:00:00.000Z" };

beforeEach(() => {
  vi.stubEnv("SESSION_SECRET", "test-secret-test-secret-test-secret");
  vi.clearAllMocks();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("encrypt / decrypt", () => {
  it("암호화한 토큰을 복호화하면 payload를 돌려준다", async () => {
    const token = await encrypt(payload);
    const result = await decrypt(token);
    expect(result?.userId).toBe("u1");
    expect(result?.expiresAt).toBe(payload.expiresAt);
  });

  it("변조된 토큰은 undefined", async () => {
    const token = await encrypt(payload);
    expect(await decrypt(token.slice(0, -2) + "xx")).toBeUndefined();
  });

  it("다른 secret으로 서명된 토큰은 undefined", async () => {
    const token = await encrypt(payload);
    vi.stubEnv("SESSION_SECRET", "another-secret-another-secret-123");
    expect(await decrypt(token)).toBeUndefined();
  });

  it("빈 값/undefined는 undefined", async () => {
    expect(await decrypt(undefined)).toBeUndefined();
    expect(await decrypt("")).toBeUndefined();
  });

  it("SESSION_SECRET이 없으면 encrypt가 에러를 던진다", async () => {
    vi.stubEnv("SESSION_SECRET", "");
    await expect(encrypt(payload)).rejects.toThrow("SESSION_SECRET");
  });
});

describe("createSession", () => {
  it("httpOnly 세션 쿠키를 7일 만료로 설정한다", async () => {
    const before = Date.now();
    await createSession("u1");

    expect(cookieStore.set).toHaveBeenCalledTimes(1);
    const [name, value, options] = cookieStore.set.mock.calls[0];
    expect(name).toBe(SESSION_COOKIE);
    expect((await decrypt(value))?.userId).toBe("u1");
    expect(options).toMatchObject({ httpOnly: true, sameSite: "lax", path: "/" });

    const week = 7 * 24 * 60 * 60 * 1000;
    const diff = (options.expires as Date).getTime() - before;
    expect(diff).toBeGreaterThanOrEqual(week);
    expect(diff).toBeLessThan(week + 5000);
  });
});

describe("deleteSession", () => {
  it("세션 쿠키를 삭제한다", async () => {
    await deleteSession();
    expect(cookieStore.delete).toHaveBeenCalledWith(SESSION_COOKIE);
  });
});

describe("getSession", () => {
  it("쿠키가 유효하면 payload를 돌려준다", async () => {
    const token = await encrypt(payload);
    cookieStore.get.mockReturnValue({ value: token });
    expect((await getSession())?.userId).toBe("u1");
  });

  it("쿠키가 없으면 undefined", async () => {
    cookieStore.get.mockReturnValue(undefined);
    expect(await getSession()).toBeUndefined();
  });
});
