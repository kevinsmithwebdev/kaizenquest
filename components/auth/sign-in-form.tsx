"use client";

import Link from "next/link";
import { useActionState } from "react";

import { signIn, type SignInState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

import { EmailField, PasswordField } from "./form-fields";

const initialState: SignInState = { error: null };

export function SignInForm() {
  const [state, formAction, pending] = useActionState(signIn, initialState);

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

        <EmailField />
        <PasswordField />

        <Button
          type="submit"
          variant="brand"
          className="h-10 w-full"
          disabled={pending}
        >
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="text-muted-foreground mt-6 text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link
          href="/sign-up"
          className="text-brand font-medium hover:underline"
        >
          Create one
        </Link>
      </p>
    </>
  );
}
