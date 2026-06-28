import { describe, expect, it } from "vitest";

import { normalizeVerificationCode } from "./normalize-verification-code";

describe("normalizeVerificationCode", () => {
  it("trims, uppercases, and removes whitespace", () => {
    expect(normalizeVerificationCode("  ab 12 cd  ")).toBe("AB12CD");
  });

  it("returns an uppercase code unchanged", () => {
    expect(normalizeVerificationCode("ABCD2345")).toBe("ABCD2345");
  });
});
