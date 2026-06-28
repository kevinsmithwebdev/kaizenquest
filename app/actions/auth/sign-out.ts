"use server";

import { redirect } from "next/navigation";

import { clearAuthCookie } from "@/lib/auth";

export async function signOut() {
  await clearAuthCookie();
  redirect("/");
}
