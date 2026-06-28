import Link from "next/link";
import { Compass } from "lucide-react";
import { redirect } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { isAuthenticated } from "@/lib/auth";
import { cn } from "@/lib/utils";

export default async function HomePage() {
  if (await isAuthenticated()) {
    redirect("/dashboard");
  }

  return (
    <div className="bg-background flex min-h-full flex-col items-center justify-center px-6 py-16">
      <main className="flex w-full max-w-lg flex-col items-center text-center">
        <div className="bg-brand text-brand-foreground mb-8 flex size-16 items-center justify-center rounded-2xl">
          <Compass className="size-9" aria-hidden />
        </div>

        <h1 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
          Kaizen Quest
        </h1>

        <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
          Create an account with your email, no credit card required.
        </p>

        <div className="mt-10 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/sign-up"
            className={cn(
              buttonVariants({ variant: "brand", size: "lg" }),
              "h-11 px-6",
            )}
          >
            Create account
          </Link>
          <Link
            href="/sign-in"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-11 px-6",
            )}
          >
            Sign in
          </Link>
        </div>
      </main>
    </div>
  );
}
