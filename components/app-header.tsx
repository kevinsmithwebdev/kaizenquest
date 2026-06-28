import { ChevronDown } from "lucide-react";

import { signOut } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          Good morning, Alex!
        </h1>
        <p className="text-sm text-muted-foreground">
          Small consistent actions. Big transformation.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <form action={signOut}>
          <Button type="submit" variant="ghost" size="sm">
            Sign out
          </Button>
        </form>

        <button
          type="button"
          className="flex items-center gap-2 rounded-lg border border-border px-2 py-1.5 text-sm transition-colors hover:bg-muted"
          aria-label="Account menu"
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-action-subtle text-sm font-medium text-action">
            A
          </span>
          <ChevronDown className="size-4 text-muted-foreground" aria-hidden />
        </button>
      </div>
    </header>
  );
}
