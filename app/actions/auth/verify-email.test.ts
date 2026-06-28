import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { verifyEmailSchema } from "./auth.schemas";
import {
  createFormData,
  expectRedirect,
  RedirectError,
} from "./test-helpers";

const mocks = vi.hoisted(() => ({
  redirect: vi.fn(),
  hashVerificationCode: vi.fn(),
  normalizeVerificationCode: vi.fn(),
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    verificationToken: {
      findFirst: vi.fn(),
      delete: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    mocks.redirect(url);
    throw new RedirectError(url);
  },
}));

vi.mock("@/lib/verification-code", () => ({
  hashVerificationCode: mocks.hashVerificationCode,
  normalizeVerificationCode: mocks.normalizeVerificationCode,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: mocks.prisma,
}));

import { verifyEmail } from "./verify-email";

describe("verifyEmail", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.normalizeVerificationCode.mockImplementation((code: string) =>
      code.trim().toUpperCase(),
    );
    mocks.hashVerificationCode.mockReturnValue("hashed-code");
    mocks.prisma.$transaction.mockResolvedValue([]);
    mocks.prisma.user.update.mockReturnValue("user-update");
    mocks.prisma.verificationToken.delete.mockReturnValue("token-delete");
  });

  it("returns a validation error for invalid input", async () => {
    const result = await verifyEmail(
      { error: null },
      createFormData({ email: "bad", code: "" }),
    );

    expect(result).toEqual({ error: "Enter a valid email" });
  });

  it('returns "Invalid input" when validation issues have no message', async () => {
    vi.spyOn(verifyEmailSchema, "safeParse").mockReturnValue({
      success: false,
      error: { issues: [{}] },
    } as never);

    const result = await verifyEmail(
      { error: null },
      createFormData({ email: "ada@example.com", code: "ABCD2345" }),
    );

    expect(result).toEqual({ error: "Invalid input" });
  });

  it("returns an error when the code is not 8 characters", async () => {
    mocks.normalizeVerificationCode.mockReturnValue("ABC");

    const result = await verifyEmail(
      { error: null },
      createFormData({ email: "ada@example.com", code: "ABC" }),
    );

    expect(result).toEqual({
      error: "Code must be 8 alphanumeric characters.",
    });
  });

  it("returns an error when the code contains invalid characters", async () => {
    mocks.normalizeVerificationCode.mockReturnValue("ABCD234!");

    const result = await verifyEmail(
      { error: null },
      createFormData({ email: "ada@example.com", code: "ABCD234!" }),
    );

    expect(result).toEqual({
      error: "Code must be 8 alphanumeric characters.",
    });
  });

  it("returns an error when the user does not exist", async () => {
    mocks.normalizeVerificationCode.mockReturnValue("ABCD2345");
    mocks.prisma.user.findUnique.mockResolvedValue(null);

    const result = await verifyEmail(
      { error: null },
      createFormData({ email: "Ada@Example.com", code: "ABCD2345" }),
    );

    expect(result).toEqual({ error: "Invalid or expired code." });
    expect(mocks.prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: "ada@example.com" },
    });
  });

  it("redirects when the email is already verified", async () => {
    mocks.normalizeVerificationCode.mockReturnValue("ABCD2345");
    mocks.prisma.user.findUnique.mockResolvedValue({
      id: "user-1",
      emailVerifiedAt: new Date("2026-01-01"),
    });

    await expectRedirect(
      verifyEmail(
        { error: null },
        createFormData({ email: "ada@example.com", code: "ABCD2345" }),
      ),
      "/sign-in",
    );
  });

  it("returns an error when the verification token is invalid", async () => {
    mocks.normalizeVerificationCode.mockReturnValue("ABCD2345");
    mocks.prisma.user.findUnique.mockResolvedValue({
      id: "user-1",
      emailVerifiedAt: null,
    });
    mocks.prisma.verificationToken.findFirst.mockResolvedValue(null);

    const result = await verifyEmail(
      { error: null },
      createFormData({ email: "ada@example.com", code: "ABCD2345" }),
    );

    expect(result).toEqual({ error: "Invalid or expired code." });
    expect(mocks.hashVerificationCode).toHaveBeenCalledWith("ABCD2345");
    expect(mocks.prisma.verificationToken.findFirst).toHaveBeenCalledWith({
      where: {
        userId: "user-1",
        token: "hashed-code",
        expiresAt: { gt: expect.any(Date) },
      },
    });
  });

  it("verifies the email and redirects to sign in on success", async () => {
    mocks.normalizeVerificationCode.mockReturnValue("ABCD2345");
    mocks.prisma.user.findUnique.mockResolvedValue({
      id: "user-1",
      emailVerifiedAt: null,
    });
    mocks.prisma.verificationToken.findFirst.mockResolvedValue({
      id: "token-1",
    });

    await expectRedirect(
      verifyEmail(
        { error: null },
        createFormData({ email: "ada@example.com", code: "ABCD2345" }),
      ),
      "/sign-in",
    );

    expect(mocks.prisma.$transaction).toHaveBeenCalledWith([
      "user-update",
      "token-delete",
    ]);
    expect(mocks.prisma.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { emailVerifiedAt: expect.any(Date) },
    });
    expect(mocks.prisma.verificationToken.delete).toHaveBeenCalledWith({
      where: { id: "token-1" },
    });
  });
});
