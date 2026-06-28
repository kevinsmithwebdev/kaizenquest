import { beforeEach, describe, expect, it, vi } from "vitest";

import { mockUser } from "./test-helpers";

const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("./get-current-user", () => ({
  getCurrentUser: mocks.getCurrentUser,
}));

import { isAuthenticated } from "./is-authenticated";

describe("isAuthenticated", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns false when there is no current user", async () => {
    mocks.getCurrentUser.mockResolvedValue(null);

    await expect(isAuthenticated()).resolves.toBe(false);
  });

  it("returns true when there is a current user", async () => {
    mocks.getCurrentUser.mockResolvedValue(mockUser);

    await expect(isAuthenticated()).resolves.toBe(true);
  });
});
