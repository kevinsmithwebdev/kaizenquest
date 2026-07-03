import { GoalsList } from "@/components/goals";
import {
  CalendarCard,
  PeriodProgressCard,
  QuoteCard,
  StreakCard,
} from "@/components/widgets";
import { getCurrentUser } from "@/lib/auth";
import { listGoalsForUser } from "@/lib/goals";
import { pickRandomQuote } from "@/lib/quotes";
import { computeUserStreak } from "@/lib/streak";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const goals = user ? await listGoalsForUser(user.id) : [];
  const streak = computeUserStreak(goals);
  const quote = pickRandomQuote();

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col gap-6">
      <p className="text-foreground shrink-0">
        Welcome to your dashboard, {user?.name ?? "there"}.
      </p>
      <div className="grid min-h-0 flex-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <GoalsList goals={goals} />
        <aside className="flex flex-col gap-4">
          <StreakCard streak={streak} />
          <CalendarCard goals={goals} />
          <PeriodProgressCard goals={goals} />
          <QuoteCard quote={quote.quote} source={quote.source} />
        </aside>
      </div>
    </div>
  );
}
