"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  GOAL_CATEGORY_CONFIG,
  type GoalCategory,
} from "@/lib/goals/goal-categories";
import { GOAL_PERIODS } from "@/lib/goals/goal.constants";
import type { GoalPeriod } from "@/lib/goals/goal.types";
import { GOAL_PERIOD_FILTER_LABELS } from "@/lib/goals/goal-period-filter";
import { cn } from "@/lib/utils";

import { GoalFormFieldError, goalFormFieldClassName } from "./goal-form-shared";

type GoalDetailsFieldsProps = {
  idPrefix: string;
  name: string;
  description: string;
  category: GoalCategory | "";
  period: GoalPeriod | "";
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onCategoryChange: (value: GoalCategory | "") => void;
  onPeriodChange: (value: GoalPeriod | "") => void;
  onNameBlur?: () => void;
  onPeriodBlur?: () => void;
  nameError?: string;
  periodError?: string;
  showNameError?: boolean;
  showPeriodError?: boolean;
  periodAllowEmpty?: boolean;
  autoFocusName?: boolean;
  typeField?: React.ReactNode;
};

export function GoalDetailsFields({
  idPrefix,
  name,
  description,
  category,
  period,
  onNameChange,
  onDescriptionChange,
  onCategoryChange,
  onPeriodChange,
  onNameBlur,
  onPeriodBlur,
  nameError,
  periodError,
  showNameError = false,
  showPeriodError = false,
  periodAllowEmpty = false,
  autoFocusName = false,
  typeField,
}: Readonly<GoalDetailsFieldsProps>) {
  return (
    <>
      <div className="grid gap-2">
        <Label htmlFor={`${idPrefix}-name`}>Name</Label>
        <Input
          id={`${idPrefix}-name`}
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          onBlur={onNameBlur}
          aria-invalid={showNameError && !!nameError}
          placeholder="e.g. Meditate"
          autoFocus={autoFocusName}
        />
        <GoalFormFieldError message={showNameError ? nameError : undefined} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`${idPrefix}-description`}>Description</Label>
        <textarea
          id={`${idPrefix}-description`}
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
          placeholder="Optional details about this goal"
          rows={3}
          className={cn(goalFormFieldClassName, "h-auto resize-none py-2")}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`${idPrefix}-category`}>Category</Label>
        <select
          id={`${idPrefix}-category`}
          value={category}
          onChange={(event) =>
            onCategoryChange(event.target.value as GoalCategory | "")
          }
          className={goalFormFieldClassName}
        >
          <option value="">No category</option>
          {GOAL_CATEGORY_CONFIG.map((config) => (
            <option key={config.slug} value={config.slug}>
              {config.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`${idPrefix}-period`}>Period</Label>
        <select
          id={`${idPrefix}-period`}
          value={period}
          onChange={(event) =>
            onPeriodChange(event.target.value as GoalPeriod | "")
          }
          onBlur={onPeriodBlur}
          aria-invalid={showPeriodError && !!periodError}
          className={goalFormFieldClassName}
        >
          {periodAllowEmpty ? <option value="">Select a period</option> : null}
          {GOAL_PERIODS.map((periodOption) => (
            <option key={periodOption} value={periodOption}>
              {GOAL_PERIOD_FILTER_LABELS[periodOption]}
            </option>
          ))}
        </select>
        <GoalFormFieldError
          message={showPeriodError ? periodError : undefined}
        />
      </div>

      {typeField}
    </>
  );
}
