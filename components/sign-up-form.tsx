"use client";

import Link from "next/link";
import { useActionState } from "react";

import { signUp, type SignUpState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

const initialState: SignUpState = { error: null };

export function SignUpForm() {
  const [state, formAction, pending] = useActionState(signUp, initialState);

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
          <label htmlFor="name" className="text-sm font-medium text-foreground">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            placeholder="Your name"
            className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none ring-ring/50 focus-visible:ring-3"
          />
        </div>

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
            autoComplete="new-password"
            required
            minLength={8}
            placeholder="••••••••"
            className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none ring-ring/50 focus-visible:ring-3"
          />
        </div>

        <Button type="submit" variant="brand" className="h-10 w-full" disabled={pending}>
          {pending ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-medium text-brand hover:underline">
          Sign in
        </Link>
      </p>
    </>
  );
}