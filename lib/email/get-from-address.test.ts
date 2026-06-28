import { afterEach, describe, expect, it, vi } from "vitest";

import { DEFAULT_FROM_ADDRESS } from "./email.constants";
import { getFromAddress } from "./get-from-address";

describe("getFromAddress", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns the default from address when EMAIL_FROM is not set", () => {
    vi.unstubAllEnvs();
    delete process.env.EMAIL_FROM;

    expect(getFromAddress()).toBe(DEFAULT_FROM_ADDRESS);
  });

  it("returns EMAIL_FROM when it is set", () => {
    vi.stubEnv("EMAIL_FROM", "Kaizen <hello@kaizen.quest>");

    expect(getFromAddress()).toBe("Kaizen <hello@kaizen.quest>");
  });
});
