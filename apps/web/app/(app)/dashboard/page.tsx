import { GoalsList } from "@/components/goals";
import {
  CalendarCard,
  PeriodProgressCard,
  QuoteCard,
  StreakCard,
} from "@/components/widgets";
import { getCurrentUser } from "@/lib/auth";
import { listGoalsForUser } from "@/lib/goals";
import type { Goal } from "@/lib/goals/goal.types";
import { pickRandomQuote } from "@/lib/quotes";
import { computeUserStreak, type UserStreak } from "@/lib/streak";

type DashboardWidgetsProps = {
  goals: Goal[];
  streak: UserStreak;
  quote: ReturnType<typeof pickRandomQuote>;
};

function DashboardWidgets({
  goals,
  streak,
  quote,
}: Readonly<DashboardWidgetsProps>) {
  return (
    <>
      <QuoteCard quote={quote.quote} source={quote.source} />
      <StreakCard streak={streak} />
      <CalendarCard goals={goals} />
      <PeriodProgressCard goals={goals} />
    </>
  );
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const goals = await listGoalsForUser(user!.id);
  const streak = computeUserStreak(goals);
  const quote = pickRandomQuote();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 lg:min-h-full lg:flex-1">
      <p className="text-foreground shrink-0">
        Welcome to your dashboard, {user!.name}.
      </p>

      {/*
        Below lg: content-sized stack (goals + widgets), page scrolls.
        lg+: goals fills remaining viewport height; widgets sit beside.
      */}
      <div className="flex flex-col gap-6 lg:min-h-0 lg:flex-1 lg:flex-row">
        <GoalsList goals={goals} />
        <aside className="hidden w-80 shrink-0 flex-col gap-4 self-start lg:flex">
          <DashboardWidgets goals={goals} streak={streak} quote={quote} />
        </aside>
      </div>

      <aside className="flex flex-col gap-4 lg:hidden">
        <DashboardWidgets goals={goals} streak={streak} quote={quote} />
      </aside>
    </div>
  );
}
