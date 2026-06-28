import { cookies } from "next/headers";

import { SESSION_COOKIE } from "@/lib/session";

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.delete(SESSION_COOKIE);
}
