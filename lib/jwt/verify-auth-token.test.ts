import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  jwtVerify: vi.fn(),
}));

vi.mock("jose", () => ({
  jwtVerify: mocks.jwtVerify,
}));

vi.mock("./get-secret-key", () => ({
  getSecretKey: () => new TextEncoder().encode("test-secret"),
}));

import { verifyAuthToken } from "./verify-auth-token";

describe("verifyAuthToken", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null for an invalid token", async () => {
    mocks.jwtVerify.mockRejectedValue(new Error("invalid token"));

    await expect(verifyAuthToken("not-a-token")).resolves.toBeNull();
  });

  it("returns null when the token subject is not a string", async () => {
    mocks.jwtVerify.mockResolvedValue({
      payload: { sub: 123 },
      protectedHeader: { alg: "HS256" },
    });

    await expect(verifyAuthToken("token")).resolves.toBeNull();
  });

  it("returns the user id for a valid token", async () => {
    mocks.jwtVerify.mockResolvedValue({
      payload: { sub: "user-1" },
      protectedHeader: { alg: "HS256" },
    });

    await expect(verifyAuthToken("valid-token")).resolves.toBe("user-1");
  });
});
