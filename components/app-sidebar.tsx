import Link from "next/link";
import { Compass } from "lucide-react";

import { mainNavItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex items-center gap-2.5 border-b border-sidebar-border px-5 py-5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-brand text-brand-foreground">
          <Compass className="size-5" aria-hidden />
        </div>
        <span className="text-base font-semibold text-sidebar-foreground">
          Kaizen Quest App
        </span>
      </div>

      <nav className="space-y-1 px-3 py-4">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === "/dashboard";

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-subtle text-brand"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex-1" />

      <div className="border-t border-sidebar-border p-4">
        <div className="rounded-xl bg-linear-to-br from-focus to-action p-4 text-white">
          <p className="text-sm font-semibold leading-snug">
            Small steps.
            <br />
            Big transformation.
          </p>
        </div>
      </div>
    </aside>
  );
}
