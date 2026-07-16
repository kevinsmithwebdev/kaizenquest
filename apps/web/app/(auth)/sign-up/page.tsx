import { Compass } from "lucide-react";

import { SignUpForm } from "@/components/auth";

export default function SignUpPage() {
  return (
    <div className="w-full max-w-md">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="bg-brand text-brand-foreground mb-4 flex size-12 items-center justify-center rounded-xl">
          <Compass className="size-6" aria-hidden />
        </div>
        <h1 className="text-foreground text-2xl font-semibold">
          Create account
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Start tracking your goals today. No credit card required.
        </p>
      </div>

      <SignUpForm />
    </div>
  );
}
