export const AUTH_TOKEN_EXPIRY = "30d";
export const AUTH_TOKEN_MAX_AGE = 60 * 60 * 24 * 30;
export const SALT_ROUNDS = 12;

export function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    throw new Error("SESSION_SECRET is not set");
  }

  return new TextEncoder().encode(secret);
}
