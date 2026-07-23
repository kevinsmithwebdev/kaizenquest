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
import { AddGoalDialog } from "./add-goal-dialog";
import { DeleteGoalDialog } from "./delete-goal-dialog";
import { EditGoalDialog } from "./edit-goal-dialog";
import { GoalListItem } from "./goal-list-item";
import { GoalsListHeader } from "./goals-list-header";

type GoalsListProps = {
  goals: Goal[];
};

export function GoalsList({ goals }: Readonly<GoalsListProps>) {
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [deletingGoal, setDeletingGoal] = useState<Goal | null>(null);
  const [addGoalOpen, setAddGoalOpen] = useState(false);
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
    <div className="flex flex-col lg:h-full lg:min-h-0 lg:flex-1">
      <Card className="flex flex-col gap-0 overflow-hidden py-0 lg:min-h-0 lg:flex-1">
        <GoalsListHeader
          selectedPeriods={selectedPeriods}
          onTogglePeriod={togglePeriod}
          availablePeriods={availablePeriods}
          showPeriodFilter={showPeriodFilter}
          onAddGoal={() => setAddGoalOpen(true)}
        />

        <ScrollFade className="lg:min-h-0 lg:flex-1">
          {visibleGoals.length === 0 ? (
            <p className="text-muted-foreground px-(--card-spacing) py-8 text-center text-sm">
              {goals.length === 0
                ? "No goals yet. Add one to get started."
                : "No goals match the selected periods."}
            </p>
          ) : (
            <ul className="flex flex-col min-[500px]:grid min-[500px]:grid-cols-[2.5rem_minmax(0,1fr)_0_8.5rem_1.75rem_2rem] min-[500px]:gap-x-4 sm:grid-cols-[2.5rem_minmax(0,1fr)_5.5rem_8.5rem_1.75rem_2rem]">
              {visibleGoals.map((goal) => (
                <GoalListItem
                  key={goal.id}
                  goal={goal}
                  onSelect={() => setSelectedGoal(goal)}
                  onEdit={() => setEditingGoal(goal)}
                  onDelete={() => setDeletingGoal(goal)}
                />
              ))}
            </ul>
          )}
        </ScrollFade>

        <CardFooter className="border-border bg-card shrink-0 border-t">
          <button
            type="button"
            className="text-action hover:text-action/80 inline-flex items-center gap-1.5 text-sm font-medium"
            onClick={() => setAddGoalOpen(true)}
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

      <AddGoalDialog open={addGoalOpen} onOpenChange={setAddGoalOpen} />

      <EditGoalDialog
        goal={editingGoal}
        open={editingGoal !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingGoal(null);
          }
        }}
      />

      <DeleteGoalDialog
        goal={deletingGoal}
        open={deletingGoal !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingGoal(null);
          }
        }}
      />
    </div>
  );
}
