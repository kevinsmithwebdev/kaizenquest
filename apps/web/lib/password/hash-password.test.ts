import { describe, expect, it } from "vitest";

import { SALT_ROUNDS } from "./password.constants";
import { hashPassword } from "./hash-password";
import { verifyPassword } from "./verify-password";

describe("hashPassword", () => {
  it("hashes a password using the configured salt rounds", async () => {
    const hash = await hashPassword("secret-password");

    expect(hash).not.toBe("secret-password");
    expect(hash.startsWith("$2")).toBe(true);
    await expect(verifyPassword("secret-password", hash)).resolves.toBe(true);
    expect(SALT_ROUNDS).toBe(12);
  });
});
