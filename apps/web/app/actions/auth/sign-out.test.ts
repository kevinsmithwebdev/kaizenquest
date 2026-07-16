import { beforeEach, describe, expect, it, vi } from "vitest";

import { expectRedirect, RedirectError } from "./test-helpers";

const mocks = vi.hoisted(() => ({
  redirect: vi.fn(),
  clearAuthCookie: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    mocks.redirect(url);
    throw new RedirectError(url);
  },
}));

vi.mock("@/lib/auth", () => ({
  clearAuthCookie: mocks.clearAuthCookie,
}));

import { signOut } from "./sign-out";

describe("signOut", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.clearAuthCookie.mockResolvedValue(undefined);
  });

  it("clears the auth cookie and redirects home", async () => {
    await expectRedirect(signOut(), "/");

    expect(mocks.clearAuthCookie).toHaveBeenCalledOnce();
    expect(mocks.redirect).toHaveBeenCalledWith("/");
  });
});
