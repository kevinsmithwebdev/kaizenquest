import { describe, expect, it } from "vitest";

import * as jwt from "./index";

describe("jwt index", () => {
  it("re-exports jwt utilities", () => {
    expect(jwt.AUTH_TOKEN_EXPIRY).toBe("30d");
    expect(jwt.AUTH_TOKEN_MAX_AGE).toBe(60 * 60 * 24 * 30);
    expect(jwt.signAuthToken).toBeTypeOf("function");
    expect(jwt.verifyAuthToken).toBeTypeOf("function");
  });
});
