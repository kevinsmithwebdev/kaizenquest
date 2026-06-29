import { getCurrentUser, type AuthUser } from "@/lib/auth";

export async function requireCurrentUser(): Promise<AuthUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}
