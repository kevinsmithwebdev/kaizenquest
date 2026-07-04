"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="bg-background flex min-h-full flex-col items-center justify-center px-6 py-16">
      <main className="flex w-full max-w-lg flex-col items-center text-center">
        <h1 className="text-foreground text-2xl font-semibold tracking-tight">
          Something went wrong
        </h1>
        <p className="text-muted-foreground mt-4 text-sm leading-relaxed">
          An unexpected error occurred. You can try again or return to the
          dashboard.
        </p>
        <div className="mt-8 flex gap-3">
          <Button type="button" variant="outline" onClick={() => reset()}>
            Try again
          </Button>
          <a
            href="/dashboard"
            className="bg-brand text-brand-foreground inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium"
          >
            Go to dashboard
          </a>
        </div>
      </main>
    </div>
  );
}
