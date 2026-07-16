import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { signAuthToken } from "./sign-auth-token";
import { verifyAuthToken } from "./verify-auth-token";

const TEST_SECRET = "test-secret-key-for-jwt-signing";

describe("signAuthToken", () => {
  beforeEach(() => {
    vi.stubEnv("SESSION_SECRET", TEST_SECRET);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("creates a verifiable auth token for the user", async () => {
    const token = await signAuthToken("user-1");

    expect(typeof token).toBe("string");
    await expect(verifyAuthToken(token)).resolves.toBe("user-1");
  });
});
