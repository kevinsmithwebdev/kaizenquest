import { describe, expect, it } from "vitest";

import * as auth from "./index";

describe("auth index", () => {
  it("re-exports auth utilities", () => {
    expect(auth.authUserSelect).toBeDefined();
    expect(auth.SESSION_COOKIE).toBe("kaizen_session");
    expect(auth.clearAuthCookie).toBeTypeOf("function");
    expect(auth.getAuthTokenFromCookie).toBeTypeOf("function");
    expect(auth.getCurrentUser).toBeTypeOf("function");
    expect(auth.isAuthenticated).toBeTypeOf("function");
    expect(auth.setAuthCookie).toBeTypeOf("function");
    expect(auth.setAuthCookieForUser).toBeTypeOf("function");
  });
});
