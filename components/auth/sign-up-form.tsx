"use client";

import Link from "next/link";
import { useActionState } from "react";

import { signUp, type SignUpState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

import { EmailField, NameField, PasswordField } from "./form-fields";

const initialState: SignUpState = { error: null };

export function SignUpForm() {
  const [state, formAction, pending] = useActionState(signUp, initialState);

  return (
    <>
      <form
        action={formAction}
        className="border-border bg-card space-y-4 rounded-2xl border p-6 shadow-sm"
      >
        {state.error ? (
          <p className="bg-destructive/10 text-destructive rounded-lg px-3 py-2 text-sm">
            {state.error}
          </p>
        ) : null}

        <NameField />
        <EmailField />
        <PasswordField autoComplete="new-password" minLength={8} />

        <Button
          type="submit"
          variant="brand"
          className="h-10 w-full"
          disabled={pending}
        >
          {pending ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="text-muted-foreground mt-6 text-center text-sm">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="text-brand font-medium hover:underline"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}
