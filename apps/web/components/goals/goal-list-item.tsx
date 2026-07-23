import { Check } from "lucide-react";
import { createElement } from "react";

import {
  getGoalCategoryColors,
  getGoalCategoryIcon,
} from "@/lib/goals/goal-categories";
import {
  getGoalProgressColor,
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
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function GoalListItem({
  goal,
  onSelect,
  onEdit,
  onDelete,
}: Readonly<GoalListItemProps>) {
  const target = getGoalTargetDisplay(goal);
  const progress = getGoalProgressDisplay(goal);
  const met = isGoalMet(goal);
  const progressColor = getGoalProgressColor(progress.percent);
  const categoryColors = getGoalCategoryColors(goal.category);
  const categoryIcon = getGoalCategoryIcon(goal.category);

  return (
    <li
      className={cn(
        "border-border hover:bg-foreground/5 border-b transition-colors last:border-b-0",
        "max-[499px]:flex max-[499px]:items-center max-[499px]:gap-1 max-[499px]:px-2.25 max-[499px]:py-4",
        "min-[500px]:col-span-full min-[500px]:grid min-[500px]:grid-cols-subgrid min-[500px]:items-center",
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-label={`Log event for ${goal.name}`}
        className={cn(
          "cursor-pointer text-left",
          "max-[499px]:grid max-[499px]:min-w-0 max-[499px]:flex-1 max-[499px]:grid-cols-[2.5rem_minmax(0,1fr)] max-[499px]:items-center max-[499px]:gap-x-3 max-[499px]:gap-y-2",
          "min-[500px]:col-span-5 min-[500px]:grid min-[500px]:w-full min-[500px]:grid-cols-subgrid min-[500px]:items-center min-[500px]:gap-x-4 min-[500px]:py-4 min-[500px]:pr-2 min-[500px]:pl-2.25",
        )}
      >
        <div
          className="flex size-10 shrink-0 items-center justify-center rounded-[calc(var(--radius-xl)/2)] max-[499px]:row-span-2"
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

        <div className="max-[499px]:col-start-2 min-[500px]:hidden">
          <p
            className="text-sm font-semibold tabular-nums"
            style={{ color: progressColor }}
          >
            {progress.current}
            <span className="text-muted-foreground font-normal">
              {" "}
              {progress.suffix}
            </span>
          </p>
        </div>

        <GoalProgressRing
          value={progress.current}
          label={progress.suffix}
          percent={progress.percent}
          color={progressColor}
          className="max-[499px]:hidden"
        />

        <div
          className={cn(
            "size-7 shrink-0 items-center justify-center justify-self-end rounded-full border-2 max-[499px]:hidden min-[500px]:flex",
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
