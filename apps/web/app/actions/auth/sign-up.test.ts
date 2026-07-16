import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { signUpSchema } from "./auth.schemas";
import { createFormData, expectRedirect, RedirectError } from "./test-helpers";

const mocks = vi.hoisted(() => ({
  redirect: vi.fn(),
  setAuthCookie: vi.fn(),
  fetch: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    mocks.redirect(url);
    throw new RedirectError(url);
  },
}));

vi.mock("@/lib/auth", () => ({
  setAuthCookie: mocks.setAuthCookie,
}));

vi.mock("@/lib/api", () => ({
  getApiGatewayUrl: () => "http://localhost:3003",
}));

import { signUp } from "./sign-up";

describe("signUp", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.setAuthCookie.mockResolvedValue(undefined);
    vi.stubGlobal("fetch", mocks.fetch);
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
    mocks.fetch.mockResolvedValue({
      ok: false,
      json: async () => ({
        message: "An account with this email already exists.",
      }),
    });

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
  });

  it("returns an error when auth service is unreachable", async () => {
    mocks.fetch.mockRejectedValue(new Error("offline"));

    const result = await signUp(
      { error: null },
      createFormData({
        name: "Ada",
        email: "ada@example.com",
        password: "password1",
      }),
    );

    expect(result).toEqual({ error: "Unable to reach auth service." });
  });

  it("creates the user, signs in, and redirects to the dashboard on success", async () => {
    mocks.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ accessToken: "jwt-token", user: { id: "user-1" } }),
    });

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

    expect(mocks.setAuthCookie).toHaveBeenCalledWith("jwt-token");
    expect(mocks.redirect).toHaveBeenCalledWith("/dashboard");
  });
});
