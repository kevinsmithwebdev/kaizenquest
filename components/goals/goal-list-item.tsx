import { Check } from "lucide-react";
import { createElement } from "react";

import {
  getGoalCategoryColors,
  getGoalCategoryIcon,
} from "@/lib/goals/goal-categories";
import {
  getGoalAccentColor,
  getGoalProgressDisplay,
  getGoalTargetDisplay,
} from "@/lib/goals/goal-display";
import { isGoalMet } from "@/lib/goals/goal-progress";
import type { Goal } from "@/lib/goals/goal.types";
import { cn } from "@/lib/utils";

import { GoalListItemMenu } from "./goal-list-item-menu";
import { GoalProgressRing } from "./goal-progress-ring";

type GoalListItemProps = {
  goal: Goal;
  colorIndex: number;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function GoalListItem({
  goal,
  colorIndex,
  onSelect,
  onEdit,
  onDelete,
}: Readonly<GoalListItemProps>) {
  const target = getGoalTargetDisplay(goal);
  const progress = getGoalProgressDisplay(goal);
  const met = isGoalMet(goal);
  const accentColor = getGoalAccentColor(colorIndex);
  const categoryColors = getGoalCategoryColors(goal.category);
  const categoryIcon = getGoalCategoryIcon(goal.category);

  return (
    <li className="border-border hover:bg-foreground/5 col-span-full grid grid-cols-subgrid items-center border-b transition-colors last:border-b-0">
      <button
        type="button"
        onClick={onSelect}
        aria-label={`Log event for ${goal.name}`}
        className="col-span-5 grid w-full cursor-pointer grid-cols-subgrid items-center gap-x-4 py-4 pr-2 pl-2.25 text-left"
      >
        <div
          className="flex size-10 shrink-0 items-center justify-center rounded-[calc(var(--radius-xl)/2)]"
          style={{
            color: categoryColors.icon,
            backgroundColor: categoryColors.background,
          }}
          aria-hidden
        >
          {createElement(categoryIcon, {
            className: "size-5",
            strokeWidth: 1.75,
          })}
        </div>

        <div className="min-w-0">
          <p className="text-foreground truncate font-semibold">{goal.name}</p>
          {goal.description ? (
            <p className="text-muted-foreground truncate text-sm">
              {goal.description}
            </p>
          ) : null}
        </div>

        <div className="text-right max-sm:hidden">
          <p className="text-foreground font-semibold tabular-nums">
            {target.value}
          </p>
          <p className="text-muted-foreground text-sm">{target.label}</p>
        </div>

        <GoalProgressRing
          value={progress.current}
          label={progress.suffix}
          percent={progress.percent}
          color={accentColor}
        />

        <div
          className={cn(
            "flex size-7 shrink-0 items-center justify-center justify-self-end rounded-full border-2",
            met
              ? "border-success bg-success-subtle text-success"
              : "border-border bg-background",
          )}
          aria-label={met ? "Goal met" : "Goal not met"}
        >
          {met ? <Check className="size-4" strokeWidth={2.5} /> : null}
        </div>
      </button>

      <GoalListItemMenu goal={goal} onEdit={onEdit} onDelete={onDelete} />
    </li>
  );
}
