import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AUTH_TOKEN_MAX_AGE } from "@/lib/jwt";
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

import { setAuthCookie } from "./set-auth-cookie";

describe("setAuthCookie", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NODE_ENV", "test");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("sets the session cookie with auth options", async () => {
    await setAuthCookie("token-123");

    expect(cookieMocks.cookieStore.set).toHaveBeenCalledWith(
      SESSION_COOKIE,
      "token-123",
      {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/",
        maxAge: AUTH_TOKEN_MAX_AGE,
      },
    );
  });
});
