import { Card, CardContent } from "@/components/ui/card";
import { GOAL_PERIODS } from "@/lib/goals/goal.constants";
import type { Goal } from "@/lib/goals/goal.types";
import {
  formatGoalsCompletedLabel,
  getPeriodProgressSummary,
  type PeriodProgressSummary,
} from "@/lib/goals/period-progress";

import { SegmentedProgressBar } from "./segmented-progress-bar";

type PeriodProgressCardProps = {
  goals: Goal[];
};

type PeriodProgressSectionProps = {
  summary: PeriodProgressSummary;
};

function PeriodProgressSection({
  summary,
}: Readonly<PeriodProgressSectionProps>) {
  return (
    <section aria-label={summary.label}>
      <h3 className="font-heading text-sm leading-snug font-semibold">
        {summary.label}
      </h3>
      <div className="mt-1 flex items-baseline justify-between gap-3">
        <p className="text-muted-foreground text-xs">
          {formatGoalsCompletedLabel(summary.completed, summary.total)}
        </p>
        <p className="text-muted-foreground text-xs tabular-nums">
          {summary.percent}%
        </p>
      </div>
      <div className="mt-2.5">
        <SegmentedProgressBar
          segments={summary.segments}
          percent={summary.percent}
        />
      </div>
    </section>
  );
}

export function PeriodProgressCard({
  goals,
}: Readonly<PeriodProgressCardProps>) {
  const summaries = GOAL_PERIODS.map((period) =>
    getPeriodProgressSummary(goals, period),
  );

  return (
    <Card>
      <CardContent className="flex flex-col gap-5">
        {summaries.map((summary) => (
          <PeriodProgressSection key={summary.period} summary={summary} />
        ))}
      </CardContent>
    </Card>
  );
}
