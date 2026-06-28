import { signAuthToken } from "@/lib/jwt";

import { setAuthCookie } from "./set-auth-cookie";

export async function setAuthCookieForUser(userId: string): Promise<void> {
  const token = await signAuthToken(userId);

  await setAuthCookie(token);
}
