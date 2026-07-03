"use client";

import Link from "next/link";
import { useActionState } from "react";

import { verifyEmail, type VerifyEmailState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

const initialState: VerifyEmailState = { error: null };

type VerifyEmailFormProps = {
  defaultEmail: string;
};

export function VerifyEmailForm({
  defaultEmail,
}: Readonly<VerifyEmailFormProps>) {
  const [state, formAction, pending] = useActionState(
    verifyEmail,
    initialState,
  );

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

        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-foreground text-sm font-medium"
          >
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
            className="border-input bg-background ring-ring/50 h-10 w-full rounded-lg border px-3 text-sm outline-none read-only:cursor-default read-only:opacity-70 focus-visible:ring-3"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="code" className="text-foreground text-sm font-medium">
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
            className="border-input bg-background ring-ring/50 h-10 w-full rounded-lg border px-3 text-sm tracking-widest uppercase outline-none focus-visible:ring-3"
          />
        </div>

        <Button
          type="submit"
          variant="brand"
          className="h-10 w-full"
          disabled={pending}
        >
          {pending ? "Verifying…" : "Verify email"}
        </Button>
      </form>

      <p className="text-muted-foreground mt-6 text-center text-sm">
        Already verified?{" "}
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
