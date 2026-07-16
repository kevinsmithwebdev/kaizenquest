import { beforeEach, describe, expect, it, vi } from "vitest";

import { authUserSelect } from "./auth.constants";
import { mockUser } from "./test-helpers";

const mocks = vi.hoisted(() => ({
  getAuthTokenFromCookie: vi.fn(),
  verifyAuthToken: vi.fn(),
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("./get-auth-token-from-cookie", () => ({
  getAuthTokenFromCookie: mocks.getAuthTokenFromCookie,
}));

vi.mock("@/lib/jwt", () => ({
  verifyAuthToken: mocks.verifyAuthToken,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: mocks.prisma,
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
    expect(mocks.prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it("returns null when the user does not exist", async () => {
    mocks.getAuthTokenFromCookie.mockResolvedValue("valid-token");
    mocks.verifyAuthToken.mockResolvedValue("user-1");
    mocks.prisma.user.findUnique.mockResolvedValue(null);

    await expect(getCurrentUser()).resolves.toBeNull();
    expect(mocks.prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: "user-1" },
      select: authUserSelect,
    });
  });

  it("returns the authenticated user", async () => {
    mocks.getAuthTokenFromCookie.mockResolvedValue("valid-token");
    mocks.verifyAuthToken.mockResolvedValue("user-1");
    mocks.prisma.user.findUnique.mockResolvedValue(mockUser);

    await expect(getCurrentUser()).resolves.toEqual(mockUser);
  });
});
