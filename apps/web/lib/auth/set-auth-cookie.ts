import { cookies } from "next/headers";

import { SESSION_COOKIE } from "@/lib/session";

import { getCookieOptions } from "./get-cookie-options";

export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, token, getCookieOptions());
}
