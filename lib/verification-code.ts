import { createHash, randomBytes } from "node:crypto";

// Excludes 0/O, 1/I/L for readability

const CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateVerificationCode(length = 8): string {
  const bytes = randomBytes(length);

  return Array.from(bytes, (b) => CHARSET[b % CHARSET.length]).join("");
}

export function normalizeVerificationCode(input: string): string {
  return input.trim().toUpperCase().replace(/\s/g, "");
}

export function hashVerificationCode(code: string): string {
  return createHash("sha256").update(normalizeVerificationCode(code)).digest("hex");
}
