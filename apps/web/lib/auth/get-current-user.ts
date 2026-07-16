import { prisma } from "@/lib/prisma";
import { verifyAuthToken } from "@/lib/jwt";

import { authUserSelect } from "./auth.constants";
import type { AuthUser } from "./auth.types";
import { getAuthTokenFromCookie } from "./get-auth-token-from-cookie";

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
