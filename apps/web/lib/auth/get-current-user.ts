import { createServerApiClient } from "@/lib/api";
import { verifyAuthToken } from "@/lib/jwt";

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

  try {
    const api = createServerApiClient();
    const user = (await api.me()) as {
      id: string;
      name: string;
      email: string;
      createdAt: string;
      updatedAt: string;
    };

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: new Date(user.createdAt),
      updatedAt: new Date(user.updatedAt),
    };
  } catch {
    return null;
  }
}
