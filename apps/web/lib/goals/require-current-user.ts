import { UnauthorizedError, getCurrentUser, type AuthUser } from "@/lib/auth";

export async function requireCurrentUser(): Promise<AuthUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw new UnauthorizedError();
  }

  return user;
}
