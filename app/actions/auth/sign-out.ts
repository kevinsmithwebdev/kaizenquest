"use server";

import { redirect } from "next/navigation";

import { clearAuthCookie } from "@/lib/auth";
import { routes } from "@/lib/navigation";

export async function signOut() {
  await clearAuthCookie();
  redirect(routes.home);
}
