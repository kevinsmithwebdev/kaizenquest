import { describe, expect, it } from "vitest";

import * as auth from "./index";

describe("auth index", () => {
  it("re-exports auth actions and types", () => {
    expect(auth.signUp).toBeTypeOf("function");
    expect(auth.signIn).toBeTypeOf("function");
    expect(auth.signOut).toBeTypeOf("function");
  });
});
