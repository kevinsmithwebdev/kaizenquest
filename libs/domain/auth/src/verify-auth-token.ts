import { jwtVerify } from "jose";

import { getSecretKey } from "./constants";

export async function verifyAuthToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}
