import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  signAuthToken: vi.fn(),
  setAuthCookie: vi.fn(),
}));

vi.mock("@/lib/jwt", () => ({
  signAuthToken: mocks.signAuthToken,
}));

vi.mock("./set-auth-cookie", () => ({
  setAuthCookie: mocks.setAuthCookie,
}));

import { setAuthCookieForUser } from "./set-auth-cookie-for-user";

describe("setAuthCookieForUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.signAuthToken.mockResolvedValue("signed-token");
    mocks.setAuthCookie.mockResolvedValue(undefined);
  });

  it("signs a token and stores it in the session cookie", async () => {
    await setAuthCookieForUser("user-1");

    expect(mocks.signAuthToken).toHaveBeenCalledWith("user-1");
    expect(mocks.setAuthCookie).toHaveBeenCalledWith("signed-token");
  });
});
