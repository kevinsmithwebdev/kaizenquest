import { createHash } from "node:crypto";

import { normalizeVerificationCode } from "./normalize-verification-code";

export function hashVerificationCode(code: string): string {
  return createHash("sha256")
    .update(normalizeVerificationCode(code))
    .digest("hex");
}
