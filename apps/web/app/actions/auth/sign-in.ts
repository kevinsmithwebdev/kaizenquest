"use server";

import { redirect } from "next/navigation";

import { setAuthCookie } from "@/lib/auth";
import { getApiGatewayUrl } from "@/lib/api";
import { routes } from "@/lib/navigation";
import { getFirstZodIssueMessage } from "@kaizen/shared-utils";

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
    return { error: getFirstZodIssueMessage(parsed.error) };
  }

  try {
    const response = await fetch(`${getApiGatewayUrl()}/auth/sign-in`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    const body = await response.json();
    if (!response.ok) {
      return {
        error:
          typeof body?.message === "string"
            ? Array.isArray(body.message)
              ? body.message.join(", ")
              : body.message
            : "Invalid email or password.",
      };
    }
    await setAuthCookie(body.accessToken as string);
  } catch {
    return { error: "Unable to reach auth service." };
  }

  redirect(routes.dashboard);
}
