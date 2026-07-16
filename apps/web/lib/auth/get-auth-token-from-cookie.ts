import { cookies } from "next/headers";

import { SESSION_COOKIE } from "@/lib/session";

export async function getAuthTokenFromCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();

  return cookieStore.get(SESSION_COOKIE)?.value;
}
