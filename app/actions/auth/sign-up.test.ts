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
  setAuthCookieForUser: vi.fn(),
  prisma: {
    user: {
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

vi.mock("@/lib/auth", () => ({
  setAuthCookieForUser: mocks.setAuthCookieForUser,
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
    mocks.prisma.user.create.mockResolvedValue({ id: "user-1" });
    mocks.setAuthCookieForUser.mockResolvedValue(undefined);
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
        emailVerifiedAt: expect.any(Date),
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

  it("creates the user, signs in, and redirects to the dashboard on success", async () => {
    await expectRedirect(
      signUp(
        { error: null },
        createFormData({
          name: "Ada",
          email: "ada@example.com",
          password: "password1",
        }),
      ),
      "/dashboard",
    );

    expect(mocks.prisma.user.create).toHaveBeenCalledWith({
      data: {
        name: "Ada",
        email: "ada@example.com",
        passwordHash: "hashed-password",
        emailVerifiedAt: expect.any(Date),
      },
    });
    expect(mocks.setAuthCookieForUser).toHaveBeenCalledWith("user-1");
    expect(mocks.redirect).toHaveBeenCalledWith("/dashboard");
  });
});
