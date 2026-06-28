export function normalizeVerificationCode(input: string): string {
  return input.trim().toUpperCase().replace(/\s/g, "");
}
