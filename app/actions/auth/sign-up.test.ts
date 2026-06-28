import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Prisma } from "@/lib/generated/prisma/client";

import { signUpSchema } from "./auth.schemas";
import {
  createFormData,
  expectRedirect,
  RedirectError,
} from "./test-helpers";

const mocks = vi.hoisted(() => ({
  redirect: vi.fn(),
  hashPassword: vi.fn(),
  sendVerificationEmail: vi.fn(),
  generateVerificationCode: vi.fn(),
  hashVerificationCode: vi.fn(),
  prisma: {
    user: {
      create: vi.fn(),
      delete: vi.fn(),
    },
    verificationToken: {
      create: vi.fn(),
    },
  },
}));

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    mocks.redirect(url);
    throw new RedirectError(url);
  },
}));

vi.mock("@/lib/password", () => ({
  hashPassword: mocks.hashPassword,
}));

vi.mock("@/lib/email", () => ({
  sendVerificationEmail: mocks.sendVerificationEmail,
}));

vi.mock("@/lib/verification-code", () => ({
  generateVerificationCode: mocks.generateVerificationCode,
  hashVerificationCode: mocks.hashVerificationCode,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: mocks.prisma,
}));

import { signUp } from "./sign-up";

describe("signUp", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.hashPassword.mockResolvedValue("hashed-password");
    mocks.generateVerificationCode.mockReturnValue("ABCD2345");
    mocks.hashVerificationCode.mockReturnValue("hashed-code");
    mocks.prisma.user.create.mockResolvedValue({ id: "user-1" });
    mocks.prisma.verificationToken.create.mockResolvedValue({});
    mocks.sendVerificationEmail.mockResolvedValue(undefined);
  });

  it("returns a validation error for invalid input", async () => {
    const result = await signUp(
      { error: null },
      createFormData({ name: "", email: "bad", password: "short" }),
    );

    expect(result).toEqual({ error: "Name is required" });
  });

  it('returns "Invalid input" when validation issues have no message', async () => {
    vi.spyOn(signUpSchema, "safeParse").mockReturnValue({
      success: false,
      error: { issues: [{}] },
    } as never);

    const result = await signUp(
      { error: null },
      createFormData({
        name: "Ada",
        email: "ada@example.com",
        password: "password1",
      }),
    );

    expect(result).toEqual({ error: "Invalid input" });
  });

  it("returns an error when the email already exists", async () => {
    mocks.prisma.user.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
        code: "P2002",
        clientVersion: "7.8.0",
      }),
    );

    const result = await signUp(
      { error: null },
      createFormData({
        name: "Ada",
        email: "Ada@Example.com",
        password: "password1",
      }),
    );

    expect(result).toEqual({
      error: "An account with this email already exists.",
    });
    expect(mocks.hashPassword).toHaveBeenCalledWith("password1");
    expect(mocks.prisma.user.create).toHaveBeenCalledWith({
      data: {
        name: "Ada",
        email: "ada@example.com",
        passwordHash: "hashed-password",
      },
    });
  });

  it("rethrows unexpected database errors", async () => {
    mocks.prisma.user.create.mockRejectedValue(new Error("database down"));

    await expect(
      signUp(
        { error: null },
        createFormData({
          name: "Ada",
          email: "ada@example.com",
          password: "password1",
        }),
      ),
    ).rejects.toThrow("database down");
  });

  it("rolls back the user when verification email sending fails", async () => {
    mocks.sendVerificationEmail.mockRejectedValue(new Error("smtp down"));

    const result = await signUp(
      { error: null },
      createFormData({
        name: "Ada",
        email: "ada@example.com",
        password: "password1",
      }),
    );

    expect(result).toEqual({
      error: "Could not send verification email. Please try again.",
    });
    expect(mocks.prisma.user.delete).toHaveBeenCalledWith({
      where: { id: "user-1" },
    });
    expect(mocks.prisma.verificationToken.create).toHaveBeenCalledWith({
      data: {
        token: "hashed-code",
        userId: "user-1",
        expiresAt: expect.any(Date),
      },
    });
  });

  it("creates the user and redirects to verify email on success", async () => {
    await expectRedirect(
      signUp(
        { error: null },
        createFormData({
          name: "Ada",
          email: "ada@example.com",
          password: "password1",
        }),
      ),
      "/verify-email?email=ada%40example.com",
    );

    expect(mocks.sendVerificationEmail).toHaveBeenCalledWith({
      to: "ada@example.com",
      name: "Ada",
      code: "ABCD2345",
    });
    expect(mocks.redirect).toHaveBeenCalledWith(
      "/verify-email?email=ada%40example.com",
    );
  });
});
