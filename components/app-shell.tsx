import type { AuthUser } from "@/lib/auth";

import { AppHeader } from "@/components/app-header";
import { AppSidebar } from "@/components/app-sidebar";

type AppShellProps = {
  children: React.ReactNode;
  user: AuthUser;
};

export function AppShell({ children, user }: AppShellProps) {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader user={user} />
        <main className="flex-1 overflow-auto bg-background p-6">{children}</main>
      </div>
    </div>
  );
}
