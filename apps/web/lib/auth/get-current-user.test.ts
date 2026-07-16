import { beforeEach, describe, expect, it, vi } from "vitest";

import { mockUser } from "./test-helpers";

const mocks = vi.hoisted(() => ({
  getAuthTokenFromCookie: vi.fn(),
  verifyAuthToken: vi.fn(),
  me: vi.fn(),
}));

vi.mock("./get-auth-token-from-cookie", () => ({
  getAuthTokenFromCookie: mocks.getAuthTokenFromCookie,
}));

vi.mock("@/lib/jwt", () => ({
  verifyAuthToken: mocks.verifyAuthToken,
}));

vi.mock("@/lib/api", () => ({
  createServerApiClient: () => ({
    me: mocks.me,
  }),
}));

import { getCurrentUser } from "./get-current-user";

describe("getCurrentUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when there is no session token", async () => {
    mocks.getAuthTokenFromCookie.mockResolvedValue(undefined);

    await expect(getCurrentUser()).resolves.toBeNull();
    expect(mocks.verifyAuthToken).not.toHaveBeenCalled();
  });

  it("returns null when the session token is invalid", async () => {
    mocks.getAuthTokenFromCookie.mockResolvedValue("bad-token");
    mocks.verifyAuthToken.mockResolvedValue(null);

    await expect(getCurrentUser()).resolves.toBeNull();
    expect(mocks.me).not.toHaveBeenCalled();
  });

  it("returns null when the user does not exist", async () => {
    mocks.getAuthTokenFromCookie.mockResolvedValue("valid-token");
    mocks.verifyAuthToken.mockResolvedValue("user-1");
    mocks.me.mockRejectedValue(new Error("not found"));

    await expect(getCurrentUser()).resolves.toBeNull();
  });

  it("returns the authenticated user", async () => {
    mocks.getAuthTokenFromCookie.mockResolvedValue("valid-token");
    mocks.verifyAuthToken.mockResolvedValue("user-1");
    mocks.me.mockResolvedValue({
      id: mockUser.id,
      name: mockUser.name,
      email: mockUser.email,
      createdAt: mockUser.createdAt.toISOString(),
      updatedAt: mockUser.updatedAt.toISOString(),
    });

    await expect(getCurrentUser()).resolves.toEqual(mockUser);
  });
});
