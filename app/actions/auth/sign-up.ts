"use server";

import { redirect } from "next/navigation";

import { sendVerificationEmail } from "@/lib/email";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import {
  generateVerificationCode,
  hashVerificationCode,
} from "@/lib/verification-code";
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
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const { name, password } = parsed.data;
  const email = parsed.data.email.toLowerCase();

  try {
    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: { name, email, passwordHash },
    });

    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.verificationToken.create({
      data: {
        token: hashVerificationCode(code),
        userId: user.id,
        expiresAt,
      },
    });

    try {
      await sendVerificationEmail({ to: email, name, code });
    } catch {
      await prisma.user.delete({ where: { id: user.id } });
      return { error: "Could not send verification email. Please try again." };
    }
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { error: "An account with this email already exists." };
    }
    throw error;
  }

  redirect(`/verify-email?email=${encodeURIComponent(email)}`);
}
