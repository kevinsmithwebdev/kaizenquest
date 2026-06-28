import { cookies } from "next/headers";

export const SESSION_COOKIE = "kaizen_session";

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.has(SESSION_COOKIE);
}
