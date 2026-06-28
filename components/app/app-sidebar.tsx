import Link from "next/link";
import { Compass } from "lucide-react";

import { mainNavItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  return (
    <aside className="border-sidebar-border bg-sidebar flex h-screen w-64 shrink-0 flex-col border-r">
      <div className="border-sidebar-border flex items-center gap-2.5 border-b px-5 py-5">
        <div className="bg-brand text-brand-foreground flex size-9 items-center justify-center rounded-lg">
          <Compass className="size-5" aria-hidden />
        </div>
        <span className="text-sidebar-foreground text-base font-semibold">
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
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
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

      <div className="border-sidebar-border border-t p-4">
        <div className="from-focus to-action rounded-xl bg-linear-to-br p-4 text-white">
          <p className="text-sm leading-snug font-semibold">
            Small steps.
            <br />
            Big transformation.
          </p>
        </div>
      </div>
    </aside>
  );
}
