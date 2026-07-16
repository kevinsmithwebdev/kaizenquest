import { AUTH_TOKEN_MAX_AGE } from "@/lib/jwt";

export function getCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: AUTH_TOKEN_MAX_AGE,
  };
}
