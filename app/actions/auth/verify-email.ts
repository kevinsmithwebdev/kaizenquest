"use server";

import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import {
  hashVerificationCode,
  normalizeVerificationCode,
} from "@/lib/verification-code";

import { verifyEmailSchema } from "./auth.schemas";
import type { VerifyEmailState } from "./auth.types";

export async function verifyEmail(
  _prevState: VerifyEmailState,
  formData: FormData,
): Promise<VerifyEmailState> {
  const parsed = verifyEmailSchema.safeParse({
    email: formData.get("email"),
    code: formData.get("code"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const email = parsed.data.email.toLowerCase();
  const code = normalizeVerificationCode(parsed.data.code);

  if (code.length !== 8 || !/^[A-Z0-9]+$/.test(code)) {
    return { error: "Code must be 8 alphanumeric characters." };
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return { error: "Invalid or expired code." };
  }

  if (user.emailVerifiedAt) {
    redirect("/sign-in");
  }

  const verificationToken = await prisma.verificationToken.findFirst({
    where: {
      userId: user.id,
      token: hashVerificationCode(code),
      expiresAt: { gt: new Date() },
    },
  });

  if (!verificationToken) {
    return { error: "Invalid or expired code." };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { emailVerifiedAt: new Date() },
    }),
    prisma.verificationToken.delete({
      where: { id: verificationToken.id },
    }),
  ]);

  redirect("/sign-in");
}
