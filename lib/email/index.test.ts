import { describe, expect, it } from "vitest";

import * as email from "./index";

describe("email index", () => {
  it("re-exports email utilities", () => {
    expect(email.DEFAULT_FROM_ADDRESS).toBeDefined();
    expect(email.VERIFICATION_EMAIL_SUBJECT).toBeDefined();
    expect(email.escapeHtml).toBeTypeOf("function");
    expect(email.getFromAddress).toBeTypeOf("function");
    expect(email.getResendClient).toBeTypeOf("function");
    expect(email.sendVerificationEmail).toBeTypeOf("function");
  });
});
