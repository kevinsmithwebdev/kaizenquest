"use client";

import Link from "next/link";
import { useActionState } from "react";

import { verifyEmail, type VerifyEmailState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

const initialState: VerifyEmailState = { error: null };

type VerifyEmailFormProps = {
  defaultEmail: string;
};

export function VerifyEmailForm({ defaultEmail }: VerifyEmailFormProps) {
  const [state, formAction, pending] = useActionState(verifyEmail, initialState);

  return (
    <>
      <form
        action={formAction}
        className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm"
      >
        {state.error ? (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {state.error}
          </p>
        ) : null}

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            defaultValue={defaultEmail}
            readOnly={defaultEmail.length > 0}
            placeholder="you@example.com"
            className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none ring-ring/50 read-only:cursor-default read-only:opacity-70 focus-visible:ring-3"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="code" className="text-sm font-medium text-foreground">
            Verification code
          </label>
          <input
            id="code"
            name="code"
            type="text"
            inputMode="text"
            autoComplete="one-time-code"
            required
            minLength={8}
            maxLength={8}
            placeholder="AB3K9P2X"
            className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm uppercase tracking-widest outline-none ring-ring/50 focus-visible:ring-3"
          />
        </div>

        <Button type="submit" variant="brand" className="h-10 w-full" disabled={pending}>
          {pending ? "Verifying…" : "Verify email"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already verified?{" "}
        <Link href="/sign-in" className="font-medium text-brand hover:underline">
          Sign in
        </Link>
      </p>
    </>
  );
}
