import type { AuthUser } from "@/lib/auth";

import { MobileNav } from "./mobile-nav";
import { UserAccountMenu } from "./user-account-menu";
import { getGreeting } from "./utils";

type AppHeaderProps = {
  user: AuthUser;
};

export function AppHeader({ user }: Readonly<AppHeaderProps>) {
  return (
    <header className="border-border bg-card flex items-center justify-between gap-4 border-b px-4 py-4 min-[1200px]:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <MobileNav />
        <div className="min-w-0">
          <h1 className="text-foreground truncate text-xl font-semibold">
            {getGreeting(user.name)}
          </h1>
          <p className="text-muted-foreground truncate text-sm">
            Small consistent actions. Big transformation.
          </p>
        </div>
      </div>

      <UserAccountMenu user={user} />
    </header>
  );
}
