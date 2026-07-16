import { beforeEach, describe, expect, it, vi } from "vitest";

import { SESSION_COOKIE } from "@/lib/session";

const cookieMocks = vi.hoisted(() => ({
  cookieStore: {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("next/headers", () => ({
  cookies: async () => cookieMocks.cookieStore,
}));

import { getAuthTokenFromCookie } from "./get-auth-token-from-cookie";

describe("getAuthTokenFromCookie", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns undefined when the session cookie is missing", async () => {
    cookieMocks.cookieStore.get.mockReturnValue(undefined);

    await expect(getAuthTokenFromCookie()).resolves.toBeUndefined();
    expect(cookieMocks.cookieStore.get).toHaveBeenCalledWith(SESSION_COOKIE);
  });

  it("returns the session token when the cookie exists", async () => {
    cookieMocks.cookieStore.get.mockReturnValue({ value: "token-123" });

    await expect(getAuthTokenFromCookie()).resolves.toBe("token-123");
  });
});
