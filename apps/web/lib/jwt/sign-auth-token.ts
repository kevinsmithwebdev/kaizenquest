import { SignJWT } from "jose";

import { AUTH_TOKEN_EXPIRY } from "./jwt.constants";
import { getSecretKey } from "./get-secret-key";

export async function signAuthToken(userId: string): Promise<string> {
  return new SignJWT({})
    .setSubject(userId)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(AUTH_TOKEN_EXPIRY)
    .sign(getSecretKey());
}
