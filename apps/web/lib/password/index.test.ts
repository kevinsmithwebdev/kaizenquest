import { describe, expect, it } from "vitest";

import * as password from "./index";

describe("password index", () => {
  it("re-exports password utilities", () => {
    expect(password.SALT_ROUNDS).toBe(12);
    expect(password.hashPassword).toBeTypeOf("function");
    expect(password.verifyPassword).toBeTypeOf("function");
  });
});
