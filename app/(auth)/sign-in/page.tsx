import { Compass } from "lucide-react";

import { SignInForm } from "@/components/sign-in-form";

export default function SignInPage() {
  return (
    <div className="w-full max-w-md">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="bg-brand text-brand-foreground mb-4 flex size-12 items-center justify-center rounded-xl">
          <Compass className="size-6" aria-hidden />
        </div>
        <h1 className="text-foreground text-2xl font-semibold">Sign in</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Welcome back. Continue your journey.
        </p>
      </div>

      <SignInForm />
    </div>
  );
}
