import Link from "next/link";
import { Compass } from "lucide-react";

import { signUp } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

export default function SignUpPage() {
  return (
    <div className="w-full max-w-md">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-brand text-brand-foreground">
          <Compass className="size-6" aria-hidden />
        </div>
        <h1 className="text-2xl font-semibold text-foreground">Create account</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Start tracking your goals today. No credit card required.
        </p>
      </div>

      <form action={signUp} className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
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
            placeholder="••••••••"
            className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none ring-ring/50 focus-visible:ring-3"
          />
        </div>

        <Button type="submit" variant="brand" className="h-10 w-full">
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-medium text-brand hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
