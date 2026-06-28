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
        className="border-border bg-card space-y-4 rounded-2xl border p-6 shadow-sm"
      >
        {state.error ? (
          <p className="bg-destructive/10 text-destructive rounded-lg px-3 py-2 text-sm">
            {state.error}
          </p>
        ) : null}

        <div className="space-y-2">
          <label htmlFor="name" className="text-foreground text-sm font-medium">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            placeholder="Your name"
            className="border-input bg-background ring-ring/50 h-10 w-full rounded-lg border px-3 text-sm outline-none focus-visible:ring-3"
          />
        </div>

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
            placeholder="you@example.com"
            className="border-input bg-background ring-ring/50 h-10 w-full rounded-lg border px-3 text-sm outline-none focus-visible:ring-3"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-foreground text-sm font-medium"
          >
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
            className="border-input bg-background ring-ring/50 h-10 w-full rounded-lg border px-3 text-sm outline-none focus-visible:ring-3"
          />
        </div>

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
