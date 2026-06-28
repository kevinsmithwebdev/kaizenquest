import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { VERIFICATION_EMAIL_SUBJECT } from "./email.constants";

const mocks = vi.hoisted(() => ({
  getResendClient: vi.fn(),
  send: vi.fn(),
}));

vi.mock("./get-resend-client", () => ({
  getResendClient: mocks.getResendClient,
}));

import { sendVerificationEmail } from "./send-verification-email";

describe("sendVerificationEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.send.mockResolvedValue({ error: null });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("logs the verification email in development when Resend is unavailable", async () => {
    mocks.getResendClient.mockReturnValue(null);
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await sendVerificationEmail({
      to: "ada@example.com",
      name: "Ada",
      code: "ABCD2345",
    });

    expect(logSpy).toHaveBeenCalledWith(
      "\n--- Verification email (dev — no RESEND_API_KEY) ---",
    );
    expect(logSpy).toHaveBeenCalledWith("To: ada@example.com");
    expect(logSpy).toHaveBeenCalledWith(
      "Hi Ada, your verification code is: ABCD2345",
    );
    expect(mocks.send).not.toHaveBeenCalled();
  });

  it("sends the verification email through Resend", async () => {
    mocks.getResendClient.mockReturnValue({ emails: { send: mocks.send } });
    vi.stubEnv("EMAIL_FROM", "Kaizen <hello@kaizen.quest>");

    await sendVerificationEmail({
      to: "ada@example.com",
      name: 'Tom & "Friends"',
      code: "ABCD2345",
    });

    expect(mocks.send).toHaveBeenCalledWith({
      from: "Kaizen <hello@kaizen.quest>",
      to: "ada@example.com",
      subject: VERIFICATION_EMAIL_SUBJECT,
      html: expect.stringContaining("Tom &amp; &quot;Friends&quot;"),
      text: expect.stringContaining('Hi Tom & "Friends",'),
    });
  });

  it("throws when Resend returns an error", async () => {
    mocks.getResendClient.mockReturnValue({ emails: { send: mocks.send } });
    mocks.send.mockResolvedValue({ error: { message: "smtp down" } });

    await expect(
      sendVerificationEmail({
        to: "ada@example.com",
        name: "Ada",
        code: "ABCD2345",
      }),
    ).rejects.toThrow("Failed to send verification email: smtp down");
  });
});
