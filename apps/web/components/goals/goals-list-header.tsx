"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { GOAL_PERIOD_FILTER_LABELS } from "@/lib/goals/goal-period-filter";
import type { GoalPeriod } from "@/lib/goals/goal.types";

type GoalsListHeaderProps = {
  selectedPeriods: ReadonlySet<GoalPeriod>;
  onTogglePeriod: (period: GoalPeriod) => void;
  availablePeriods: GoalPeriod[];
  showPeriodFilter: boolean;
  onAddGoal: () => void;
};

const formatCurrentDate = (date = new Date()): string => {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(date);
};

export function GoalsListHeader({
  selectedPeriods,
  onTogglePeriod,
  availablePeriods,
  showPeriodFilter,
  onAddGoal,
}: Readonly<GoalsListHeaderProps>) {
  return (
    <div className="border-border shrink-0 border-b px-(--card-spacing) py-(--card-spacing)">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h2 className="font-heading text-base leading-snug font-medium">
            Current Goals
          </h2>
          <p className="text-muted-foreground text-sm">{formatCurrentDate()}</p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {showPeriodFilter ? (
            <ButtonGroup aria-label="Filter goals by period">
              {availablePeriods.map((period) => {
                const isSelected = selectedPeriods.has(period);

                return (
                  <Button
                    key={period}
                    type="button"
                    size="sm"
                    variant={isSelected ? "default" : "outline"}
                    aria-pressed={isSelected}
                    className="h-auto px-3.5 py-2.5"
                    onClick={() => onTogglePeriod(period)}
                  >
                    {GOAL_PERIOD_FILTER_LABELS[period]}
                  </Button>
                );
              })}
            </ButtonGroup>
          ) : null}

          <Button type="button" variant="outline" size="sm" onClick={onAddGoal}>
            <Plus data-icon="inline-start" />
            Add Goal
          </Button>
        </div>
      </div>
    </div>
  );
}
