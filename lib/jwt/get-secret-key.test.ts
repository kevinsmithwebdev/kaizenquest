import { afterEach, describe, expect, it, vi } from "vitest";

import { getSecretKey } from "./get-secret-key";

describe("getSecretKey", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("throws when SESSION_SECRET is not set", () => {
    vi.unstubAllEnvs();
    delete process.env.SESSION_SECRET;

    expect(() => getSecretKey()).toThrow("SESSION_SECRET is not set");
  });

  it("encodes SESSION_SECRET as a Uint8Array", () => {
    vi.stubEnv("SESSION_SECRET", "test-secret");

    expect(getSecretKey()).toEqual(new TextEncoder().encode("test-secret"));
  });
});
