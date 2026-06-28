import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  Resend: vi.fn(function Resend(this: { emails: { send: ReturnType<typeof vi.fn> } }) {
    this.emails = { send: vi.fn() };
  }),
}));

vi.mock("resend", () => ({
  Resend: mocks.Resend,
}));

import {
  getResendClient,
  resetResendClientForTests,
} from "./get-resend-client";

describe("getResendClient", () => {
  beforeEach(() => {
    resetResendClientForTests();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    resetResendClientForTests();
  });

  it("returns null when RESEND_API_KEY is not set", () => {
    vi.unstubAllEnvs();
    delete process.env.RESEND_API_KEY;

    expect(getResendClient()).toBeNull();
    expect(mocks.Resend).not.toHaveBeenCalled();
  });

  it("creates a Resend client when RESEND_API_KEY is set", () => {
    vi.stubEnv("RESEND_API_KEY", "re_test_key");

    const client = getResendClient();

    expect(client).not.toBeNull();
    expect(mocks.Resend).toHaveBeenCalledWith("re_test_key");
  });

  it("reuses the cached client", () => {
    vi.stubEnv("RESEND_API_KEY", "re_test_key");

    getResendClient();
    getResendClient();

    expect(mocks.Resend).toHaveBeenCalledOnce();
  });
});
