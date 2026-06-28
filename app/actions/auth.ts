"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { clearAuthCookie, setAuthCookieForUser } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";
import { sendVerificationEmail } from "@/lib/email";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import {
  generateVerificationCode,
  hashVerificationCode,
  normalizeVerificationCode,
} from "@/lib/verification-code";
import { Prisma } from "@/lib/generated/prisma/client";

const signUpSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const verifyEmailSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  code: z.string().trim().min(1, "Code is required"),
});

const signInSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export type SignUpState = {
  error: string | null;
};

export type VerifyEmailState = {
  error: string | null;
};

export type SignInState = {
  error: string | null;
};

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
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const email = parsed.data.email.toLowerCase();
  const { password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "Invalid email or password." };
  }

  if (!user.emailVerifiedAt) {
    return { error: "Please verify your email before signing in." };
  }

  await setAuthCookieForUser(user.id);

  redirect("/dashboard");
}

export async function signOut() {
  await clearAuthCookie();
  redirect("/");
}
