// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/session", () => ({
  SESSION_COOKIE: "session",
  decrypt: vi.fn(),
}));

import { decrypt, SESSION_COOKIE } from "@/lib/session";
import proxy from "@/proxy";

const mockDecrypt = vi.mocked(decrypt);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("proxy", () => {
  it("세션이 있으면 요청한 보호 경로를 통과시킨다", async () => {
    mockDecrypt.mockResolvedValue({ userId: "u1", expiresAt: "" });
    const request = new NextRequest("http://localhost/admin/users?tab=roles", {
      headers: { cookie: `${SESSION_COOKIE}=signed-token` },
    });

    const response = await proxy(request);

    expect(mockDecrypt).toHaveBeenCalledWith("signed-token");
    expect(response.headers.get("x-middleware-next")).toBe("1");
    expect(response.headers.get("location")).toBeNull();
  });
});