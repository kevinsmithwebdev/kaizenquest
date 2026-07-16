import { getCurrentUser } from "./get-current-user";

export async function isAuthenticated(): Promise<boolean> {
  return (await getCurrentUser()) !== null;
}
