import { SignJWT } from "jose";

import { AUTH_TOKEN_EXPIRY, getSecretKey } from "./constants";

export async function signAuthToken(userId: string): Promise<string> {
  return new SignJWT({})
    .setSubject(userId)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(AUTH_TOKEN_EXPIRY)
    .sign(getSecretKey());
}
