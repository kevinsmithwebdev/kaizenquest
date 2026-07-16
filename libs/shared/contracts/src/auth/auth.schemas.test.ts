import { describe, expect, it } from "vitest";

import {
  MIN_PASSWORD_LENGTH,
  authTokenResponseSchema,
  signInSchema,
  signUpSchema,
} from "../index";

describe("signUpSchema", () => {
  it("accepts a valid sign-up payload", () => {
    const result = signUpSchema.safeParse({
      name: "Ada",
      email: "ada@example.com",
      password: "a".repeat(MIN_PASSWORD_LENGTH),
    });

    expect(result.success).toBe(true);
  });

  it("rejects a short password", () => {
    const result = signUpSchema.safeParse({
      name: "Ada",
      email: "ada@example.com",
      password: "short",
    });

    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = signUpSchema.safeParse({
      name: "Ada",
      email: "not-an-email",
      password: "a".repeat(MIN_PASSWORD_LENGTH),
    });

    expect(result.success).toBe(false);
  });
});

describe("signInSchema", () => {
  it("accepts a valid sign-in payload", () => {
    const result = signInSchema.safeParse({
      email: "ada@example.com",
      password: "secret",
    });

    expect(result.success).toBe(true);
  });
});

describe("authTokenResponseSchema", () => {
  it("accepts a token response with ISO timestamps", () => {
    const result = authTokenResponseSchema.safeParse({
      accessToken: "jwt.token.here",
      user: {
        id: "user-1",
        name: "Ada",
        email: "ada@example.com",
        createdAt: "2026-07-16T10:00:00.000Z",
        updatedAt: "2026-07-16T10:00:00.000Z",
      },
    });

    expect(result.success).toBe(true);
  });
});
