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

const formatCompactDate = (date = new Date()): string => {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
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
      <div className="flex flex-col gap-3 min-[500px]:flex-row min-[500px]:items-center min-[500px]:justify-between min-[500px]:gap-4">
        <div className="min-w-0">
          <h2 className="font-heading text-base leading-snug font-medium">
            Current Goals
          </h2>
          <p className="text-muted-foreground text-sm">
            <span className="min-[500px]:hidden">{formatCompactDate()}</span>
            <span className="max-[499px]:hidden">{formatCurrentDate()}</span>
          </p>
        </div>

        <div className="flex min-w-0 flex-wrap items-center gap-2 min-[500px]:shrink-0 min-[500px]:gap-3">
          {showPeriodFilter ? (
            <ButtonGroup
              aria-label="Filter goals by period"
              className="min-w-0 max-[499px]:flex-1 max-[499px]:[&_button]:min-w-0 max-[499px]:[&_button]:flex-1 max-[499px]:[&_button]:px-2"
            >
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

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={onAddGoal}
          >
            <Plus data-icon="inline-start" />
            <span className="max-[499px]:hidden">Add Goal</span>
            <span className="min-[500px]:hidden">Add</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
