import { ChevronDown } from "lucide-react";

import { signOut } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import type { AuthUser } from "@/lib/auth";

type AppHeaderProps = {
  user: AuthUser;
};

function getGreeting(name: string): string {
  const hour = new Date().getHours();

  if (hour < 12) {
    return `Good morning, ${name}!`;
  }

  if (hour < 18) {
    return `Good afternoon, ${name}!`;
  }

  return `Good evening, ${name}!`;
}

function getInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "?";
}

export function AppHeader({ user }: AppHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-6 py-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          {getGreeting(user.name)}
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
            {getInitial(user.name)}
          </span>
          <ChevronDown className="size-4 text-muted-foreground" aria-hidden />
        </button>
      </div>
    </header>
  );
}
