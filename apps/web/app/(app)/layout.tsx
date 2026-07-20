import { redirect } from "next/navigation";

import { AppShell } from "@/components/app";
import { getCurrentUser } from "@/lib/auth";
import { routes } from "@/lib/navigation";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(routes.signIn);
  }

  return <AppShell user={user}>{children}</AppShell>;
}
