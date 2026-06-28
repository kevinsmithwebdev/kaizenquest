import { describe, expect, it } from "vitest";

import * as verificationCode from "./index";

describe("verification-code index", () => {
  it("re-exports verification code utilities", () => {
    expect(verificationCode.DEFAULT_VERIFICATION_CODE_LENGTH).toBe(8);
    expect(verificationCode.VERIFICATION_CODE_CHARSET).toBeDefined();
    expect(verificationCode.generateVerificationCode).toBeTypeOf("function");
    expect(verificationCode.normalizeVerificationCode).toBeTypeOf("function");
    expect(verificationCode.hashVerificationCode).toBeTypeOf("function");
  });
});
