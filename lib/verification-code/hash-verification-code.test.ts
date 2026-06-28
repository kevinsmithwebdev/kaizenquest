import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";

import { hashVerificationCode } from "./hash-verification-code";

describe("hashVerificationCode", () => {
  it("returns the sha256 hash of the normalized code", () => {
    const normalized = "AB12CD";
    const expected = createHash("sha256").update(normalized).digest("hex");

    expect(hashVerificationCode("  ab 12 cd  ")).toBe(expected);
  });
});
