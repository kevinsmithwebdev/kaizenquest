"use server";

import { redirect } from "next/navigation";

import { setAuthCookieForUser } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { routes } from "@/lib/navigation";
import { getFirstZodIssueMessage } from "@/lib/zod/get-first-zod-issue-message";

import { signInSchema } from "./auth.schemas";
import type { SignInState } from "./auth.types";

export async function signIn(
  _prevState: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      error: getFirstZodIssueMessage(parsed.error),
    };
  }

  const email = parsed.data.email.toLowerCase();
  const { password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "Invalid email or password." };
  }

  await setAuthCookieForUser(user.id);

  redirect(routes.dashboard);
}
