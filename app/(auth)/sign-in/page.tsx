import { Compass } from "lucide-react";

import { SignInForm } from "@/components/sign-in-form";

export default function SignInPage() {
  return (
    <div className="w-full max-w-md">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-brand text-brand-foreground">
          <Compass className="size-6" aria-hidden />
        </div>
        <h1 className="text-2xl font-semibold text-foreground">Sign in</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Welcome back. Continue your journey.
        </p>
      </div>

      <SignInForm />
    </div>
  );
}
