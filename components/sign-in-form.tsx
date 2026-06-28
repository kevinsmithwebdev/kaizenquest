"use client";

import Link from "next/link";
import { useActionState } from "react";

import { signIn, type SignInState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

const initialState: SignInState = { error: null };

export function SignInForm() {
  const [state, formAction, pending] = useActionState(signIn, initialState);

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
            placeholder="you@example.com"
            className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none ring-ring/50 focus-visible:ring-3"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-foreground">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
            className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none ring-ring/50 focus-visible:ring-3"
          />
        </div>

        <Button type="submit" variant="brand" className="h-10 w-full" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="font-medium text-brand hover:underline">
          Create one
        </Link>
      </p>
    </>
  );
}
