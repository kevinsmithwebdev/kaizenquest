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

import { clearAuthCookie } from "./clear-auth-cookie";

describe("clearAuthCookie", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes the session cookie", async () => {
    await clearAuthCookie();

    expect(cookieMocks.cookieStore.delete).toHaveBeenCalledWith(SESSION_COOKIE);
  });
});
