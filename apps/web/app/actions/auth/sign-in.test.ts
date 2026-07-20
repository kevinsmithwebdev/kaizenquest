import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { signInSchema } from "./auth.schemas";
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

import { signIn } from "./sign-in";

describe("signIn", () => {
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

  it("returns an error when auth service rejects credentials", async () => {
    mocks.fetch.mockResolvedValue({
      ok: false,
      json: async () => ({ message: "Invalid email or password." }),
    });

    const result = await signIn(
      { error: null },
      createFormData({ email: "ada@example.com", password: "wrong" }),
    );

    expect(result).toEqual({ error: "Invalid email or password." });
  });

  it("returns a joined error when auth service returns message arrays", async () => {
    mocks.fetch.mockResolvedValue({
      ok: false,
      json: async () => ({
        message: ["Email is required", "Password is required"],
      }),
    });

    const result = await signIn(
      { error: null },
      createFormData({ email: "ada@example.com", password: "wrong" }),
    );

    expect(result).toEqual({
      error: "Email is required, Password is required",
    });
  });

  it("returns a fallback error when auth service returns no message", async () => {
    mocks.fetch.mockResolvedValue({
      ok: false,
      json: async () => ({}),
    });

    const result = await signIn(
      { error: null },
      createFormData({ email: "ada@example.com", password: "wrong" }),
    );

    expect(result).toEqual({ error: "Invalid email or password." });
  });

  it("returns an error when auth service is unreachable", async () => {
    mocks.fetch.mockRejectedValue(new Error("offline"));

    const result = await signIn(
      { error: null },
      createFormData({ email: "ada@example.com", password: "password1" }),
    );

    expect(result).toEqual({ error: "Unable to reach auth service." });
  });

  it("sets the auth cookie and redirects to the dashboard on success", async () => {
    mocks.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ accessToken: "jwt-token", user: { id: "user-1" } }),
    });

    await expectRedirect(
      signIn(
        { error: null },
        createFormData({ email: "ada@example.com", password: "password1" }),
      ),
      "/dashboard",
    );

    expect(mocks.setAuthCookie).toHaveBeenCalledWith("jwt-token");
    expect(mocks.redirect).toHaveBeenCalledWith("/dashboard");
  });
});
