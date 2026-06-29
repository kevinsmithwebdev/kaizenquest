import { GoalsDebugLoader } from "@/app/(app)/dashboard/goals-debug-loader";
import { getCurrentUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  return (
    <>
      <GoalsDebugLoader />
      <p className="text-foreground">
        Welcome to your dashboard, {user?.name ?? "there"}.
      </p>
    </>
  );
}
