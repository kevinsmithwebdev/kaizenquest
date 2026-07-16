import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { signInSchema } from "./auth.schemas";
import { createFormData, expectRedirect, RedirectError } from "./test-helpers";

const mocks = vi.hoisted(() => ({
  redirect: vi.fn(),
  setAuthCookieForUser: vi.fn(),
  verifyPassword: vi.fn(),
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    mocks.redirect(url);
    throw new RedirectError(url);
  },
}));

vi.mock("@/lib/auth", () => ({
  setAuthCookieForUser: mocks.setAuthCookieForUser,
}));

vi.mock("@/lib/password", () => ({
  verifyPassword: mocks.verifyPassword,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: mocks.prisma,
}));

import { signIn } from "./sign-in";

describe("signIn", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.verifyPassword.mockResolvedValue(true);
    mocks.setAuthCookieForUser.mockResolvedValue(undefined);
  });

  it("returns a validation error for invalid input", async () => {
    const result = await signIn(
      { error: null },
      createFormData({ email: "bad", password: "" }),
    );

    expect(result).toEqual({ error: "Enter a valid email" });
  });

  it('returns "Invalid input" when validation issues have no message', async () => {
    vi.spyOn(signInSchema, "safeParse").mockReturnValue({
      success: false,
      error: { issues: [{}] },
    } as never);

    const result = await signIn(
      { error: null },
      createFormData({ email: "ada@example.com", password: "password1" }),
    );

    expect(result).toEqual({ error: "Invalid input" });
  });

  it("returns an error when the user does not exist", async () => {
    mocks.prisma.user.findUnique.mockResolvedValue(null);

    const result = await signIn(
      { error: null },
      createFormData({ email: "Ada@Example.com", password: "password1" }),
    );

    expect(result).toEqual({ error: "Invalid email or password." });
    expect(mocks.prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: "ada@example.com" },
    });
    expect(mocks.verifyPassword).not.toHaveBeenCalled();
  });

  it("returns an error when the password is invalid", async () => {
    mocks.prisma.user.findUnique.mockResolvedValue({
      id: "user-1",
      passwordHash: "hashed-password",
    });
    mocks.verifyPassword.mockResolvedValue(false);

    const result = await signIn(
      { error: null },
      createFormData({ email: "ada@example.com", password: "wrong-password" }),
    );

    expect(result).toEqual({ error: "Invalid email or password." });
    expect(mocks.verifyPassword).toHaveBeenCalledWith(
      "wrong-password",
      "hashed-password",
    );
  });

  it("sets the auth cookie and redirects to the dashboard on success", async () => {
    mocks.prisma.user.findUnique.mockResolvedValue({
      id: "user-1",
      passwordHash: "hashed-password",
    });

    await expectRedirect(
      signIn(
        { error: null },
        createFormData({ email: "ada@example.com", password: "password1" }),
      ),
      "/dashboard",
    );

    expect(mocks.setAuthCookieForUser).toHaveBeenCalledWith("user-1");
    expect(mocks.redirect).toHaveBeenCalledWith("/dashboard");
  });
});
