import { describe, expect, it } from "vitest";

import { hashPassword } from "./hash-password";
import { verifyPassword } from "./verify-password";

describe("verifyPassword", () => {
  it("returns true when the password matches the hash", async () => {
    const hash = await hashPassword("secret-password");

    await expect(verifyPassword("secret-password", hash)).resolves.toBe(true);
  });

  it("returns false when the password does not match the hash", async () => {
    const hash = await hashPassword("secret-password");

    await expect(verifyPassword("wrong-password", hash)).resolves.toBe(false);
  });
});
