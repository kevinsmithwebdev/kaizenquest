import { LayoutDashboard, type LucideIcon } from "lucide-react";

export const routes = {
  home: "/",
  dashboard: "/dashboard",
  signIn: "/sign-in",
  signUp: "/sign-up",
} as const;

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const mainNavItems: NavItem[] = [
  { label: "Dashboard", href: routes.dashboard, icon: LayoutDashboard },
];
