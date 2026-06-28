import { SignJWT, jwtVerify } from "jose";

export const AUTH_TOKEN_EXPIRY = "30d";
export const AUTH_TOKEN_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    throw new Error("SESSION_SECRET is not set");
  }

  return new TextEncoder().encode(secret);
}

export async function signAuthToken(userId: string): Promise<string> {
  return new SignJWT({})
    .setSubject(userId)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(AUTH_TOKEN_EXPIRY)
    .sign(getSecretKey());
}

export async function verifyAuthToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}
