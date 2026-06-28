import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";
import { AUTH_TOKEN_MAX_AGE, signAuthToken, verifyAuthToken } from "@/lib/jwt";
import { SESSION_COOKIE } from "@/lib/session";

export { SESSION_COOKIE } from "@/lib/session";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  emailVerifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

const authUserSelect = {
  id: true,
  name: true,
  email: true,
  emailVerifiedAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

function getCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: AUTH_TOKEN_MAX_AGE,
  };
}

export async function getAuthTokenFromCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();

  return cookieStore.get(SESSION_COOKIE)?.value;
}

export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, token, getCookieOptions());
}

export async function setAuthCookieForUser(userId: string): Promise<void> {
  const token = await signAuthToken(userId);

  await setAuthCookie(token);
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = await getAuthTokenFromCookie();

  if (!token) {
    return null;
  }

  const userId = await verifyAuthToken(token);

  if (!userId) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: userId },
    select: authUserSelect,
  });
}

export async function isAuthenticated(): Promise<boolean> {
  return (await getCurrentUser()) !== null;
}
