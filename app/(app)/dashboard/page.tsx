import { GoalsList } from "@/components/goals";
import { getCurrentUser } from "@/lib/auth";
import { listGoalsForUser } from "@/lib/goals";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const goals = user ? await listGoalsForUser(user.id) : [];

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col gap-6">
      <p className="text-foreground shrink-0">
        Welcome to your dashboard, {user?.name ?? "there"}.
      </p>
      <GoalsList goals={goals} />
    </div>
  );
}
