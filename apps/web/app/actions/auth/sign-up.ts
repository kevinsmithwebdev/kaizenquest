"use server";

import { redirect } from "next/navigation";

import { setAuthCookie } from "@/lib/auth";
import { formatApiErrorMessage } from "@/lib/auth/format-api-error-message";
import { getApiGatewayUrl } from "@/lib/api";
import { routes } from "@/lib/navigation";
import { getFirstZodIssueMessage } from "@kaizen/shared-utils";

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
    return { error: getFirstZodIssueMessage(parsed.error) };
  }

  try {
    const response = await fetch(`${getApiGatewayUrl()}/auth/sign-up`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    const body = await response.json();
    if (!response.ok) {
      return {
        error: formatApiErrorMessage(
          body?.message,
          "Unable to create account.",
        ),
      };
    }
    await setAuthCookie(body.accessToken as string);
  } catch {
    return { error: "Unable to reach auth service." };
  }

  redirect(routes.dashboard);
}
