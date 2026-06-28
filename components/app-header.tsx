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
    <header className="border-border bg-card flex items-center justify-between border-b px-6 py-4">
      <div>
        <h1 className="text-foreground text-xl font-semibold">
          {getGreeting(user.name)}
        </h1>
        <p className="text-muted-foreground text-sm">
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
          className="border-border hover:bg-muted flex items-center gap-2 rounded-lg border px-2 py-1.5 text-sm transition-colors"
          aria-label="Account menu"
        >
          <span className="bg-action-subtle text-action flex size-8 items-center justify-center rounded-full text-sm font-medium">
            {getInitial(user.name)}
          </span>
          <ChevronDown className="text-muted-foreground size-4" aria-hidden />
        </button>
      </div>
    </header>
  );
}
