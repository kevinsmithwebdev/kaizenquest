import { afterEach, describe, expect, it, vi } from "vitest";

import { AUTH_TOKEN_MAX_AGE } from "@/lib/jwt";

import { getCookieOptions } from "./get-cookie-options";

describe("getCookieOptions", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns development cookie options", () => {
    vi.stubEnv("NODE_ENV", "development");

    expect(getCookieOptions()).toEqual({
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: AUTH_TOKEN_MAX_AGE,
    });
  });

  it("returns production cookie options", () => {
    vi.stubEnv("NODE_ENV", "production");

    expect(getCookieOptions()).toEqual({
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: AUTH_TOKEN_MAX_AGE,
    });
  });
});
