"use server";

import { redirect } from "next/navigation";

import { setAuthCookieForUser } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { routes } from "@/lib/navigation";
import { getFirstZodIssueMessage } from "@/lib/zod/get-first-zod-issue-message";
import { Prisma } from "@/lib/generated/prisma/client";

import { signUpSchema } from "./auth.schemas";
import type { SignUpState } from "./auth.types";

export async function signUp(
  _prevState: SignUpState,
  formData: FormData,
): Promise<SignUpState> {
  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      error: getFirstZodIssueMessage(parsed.error),
    };
  }

  const { name, password } = parsed.data;
  const email = parsed.data.email.toLowerCase();

  let userId: string;

  try {
    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
    });

    userId = user.id;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { error: "An account with this email already exists." };
    }
    throw error;
  }

  await setAuthCookieForUser(userId);

  redirect(routes.dashboard);
}
