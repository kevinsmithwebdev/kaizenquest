import { randomBytes } from "node:crypto";

import {
  DEFAULT_VERIFICATION_CODE_LENGTH,
  VERIFICATION_CODE_CHARSET,
} from "./verification-code.constants";

export function generateVerificationCode(
  length = DEFAULT_VERIFICATION_CODE_LENGTH,
): string {
  const bytes = randomBytes(length);

  return Array.from(bytes, (byte) =>
    VERIFICATION_CODE_CHARSET[byte % VERIFICATION_CODE_CHARSET.length],
  ).join("");
}
