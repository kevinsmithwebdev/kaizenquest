"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { GOAL_PERIODS } from "@/lib/goals/goal.constants";
import type { Goal, GoalPeriod } from "@/lib/goals/goal.types";
import {
  filterGoalsBySelectedPeriods,
  getGoalPeriodsPresent,
  shouldShowPeriodFilter,
} from "@/lib/goals/goal-period-filter";
import { Card, CardFooter } from "@/components/ui/card";
import { ScrollFade } from "@/components/ui/scroll-fade";

import { AddEventDialog } from "./add-event-dialog";
import { GoalListItem } from "./goal-list-item";
import { GoalsListHeader } from "./goals-list-header";

type GoalsListProps = {
  goals: Goal[];
};

export function GoalsList({ goals }: GoalsListProps) {
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [selectedPeriods, setSelectedPeriods] = useState<Set<GoalPeriod>>(
    () => new Set(GOAL_PERIODS),
  );

  const availablePeriods = useMemo(() => getGoalPeriodsPresent(goals), [goals]);
  const showPeriodFilter = shouldShowPeriodFilter(goals);
  const visibleGoals = useMemo(
    () =>
      filterGoalsBySelectedPeriods(goals, selectedPeriods, availablePeriods),
    [goals, selectedPeriods, availablePeriods],
  );

  const togglePeriod = (period: GoalPeriod) => {
    setSelectedPeriods((current) => {
      const next = new Set(current);

      if (next.has(period)) {
        next.delete(period);
      } else {
        next.add(period);
      }

      return next;
    });
  };

  return (
    <>
      <Card className="flex min-h-0 flex-1 flex-col gap-0 overflow-hidden py-0">
        <GoalsListHeader
          selectedPeriods={selectedPeriods}
          onTogglePeriod={togglePeriod}
          availablePeriods={availablePeriods}
          showPeriodFilter={showPeriodFilter}
        />

        <ScrollFade className="min-h-0 flex-1">
          {visibleGoals.length === 0 ? (
            <p className="text-muted-foreground px-(--card-spacing) py-8 text-center text-sm">
              {goals.length === 0
                ? "No goals yet. Add one to get started."
                : "No goals match the selected periods."}
            </p>
          ) : (
            <ul className="grid grid-cols-[2.5rem_minmax(0,1fr)_0_8.5rem_1.75rem] gap-x-4 sm:grid-cols-[2.5rem_minmax(0,1fr)_5.5rem_8.5rem_1.75rem]">
              {visibleGoals.map((goal, index) => (
                <GoalListItem
                  key={goal.id}
                  goal={goal}
                  colorIndex={index}
                  onSelect={() => setSelectedGoal(goal)}
                />
              ))}
            </ul>
          )}
        </ScrollFade>

        <CardFooter className="border-border bg-card shrink-0 border-t">
          <button
            type="button"
            className="text-action hover:text-action/80 inline-flex items-center gap-1.5 text-sm font-medium"
          >
            <Plus className="size-4" />
            Add Another Goal
          </button>
        </CardFooter>
      </Card>

      <AddEventDialog
        goal={selectedGoal}
        open={selectedGoal !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedGoal(null);
          }
        }}
      />
    </>
  );
}
