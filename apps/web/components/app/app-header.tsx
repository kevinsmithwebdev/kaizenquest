import type { AuthUser } from "@/lib/auth";

import { UserAccountMenu } from "./user-account-menu";
import { getGreeting } from "./utils";

type AppHeaderProps = {
  user: AuthUser;
};

export function AppHeader({ user }: Readonly<AppHeaderProps>) {
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

      <UserAccountMenu user={user} />
    </header>
  );
}
