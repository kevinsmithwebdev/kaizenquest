import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  DEFAULT_VERIFICATION_CODE_LENGTH,
  VERIFICATION_CODE_CHARSET,
} from "./verification-code.constants";

const mocks = vi.hoisted(() => ({
  randomBytes: vi.fn(),
}));

vi.mock("node:crypto", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:crypto")>();

  return {
    ...actual,
    randomBytes: mocks.randomBytes,
  };
});

import { generateVerificationCode } from "./generate-verification-code";

describe("generateVerificationCode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("generates a code with the default length", () => {
    mocks.randomBytes.mockReturnValue(
      Buffer.from([0, 1, 2, 3, 4, 5, 6, 7]),
    );

    expect(generateVerificationCode()).toBe("ABCDEFGH");
    expect(mocks.randomBytes).toHaveBeenCalledWith(
      DEFAULT_VERIFICATION_CODE_LENGTH,
    );
  });

  it("generates a code with a custom length", () => {
    mocks.randomBytes.mockReturnValue(Buffer.from([31, 30]));

    expect(generateVerificationCode(2)).toBe("98");
    expect(mocks.randomBytes).toHaveBeenCalledWith(2);
  });

  it("uses only characters from the verification charset", () => {
    mocks.randomBytes.mockReturnValue(Buffer.from([0, 15, 31]));

    const code = generateVerificationCode(3);

    expect(
      [...code].every((character) =>
        VERIFICATION_CODE_CHARSET.includes(character),
      ),
    ).toBe(true);
  });
});
