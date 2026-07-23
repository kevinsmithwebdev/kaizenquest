import type { AuthUser } from "@/lib/auth";

import { AppHeader } from "./app-header";
import { AppSidebar } from "./app-sidebar";

type AppShellProps = {
  children: React.ReactNode;
  user: AuthUser;
};

export function AppShell({ children, user }: Readonly<AppShellProps>) {
  return (
    <div className="flex h-dvh min-h-0">
      <AppSidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <AppHeader user={user} />
        <main className="bg-background flex min-h-0 flex-1 flex-col overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
