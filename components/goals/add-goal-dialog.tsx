"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { createGoal } from "@/app/actions/goals";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NumberStepperInput } from "@/components/ui/number-stepper-input";
import {
  GOAL_CATEGORY_CONFIG,
  type GoalCategory,
} from "@/lib/goals/goal-categories";
import {
  GOAL_PERIODS,
  GOAL_TYPE_LABELS,
  GOAL_TYPES,
} from "@/lib/goals/goal.constants";
import {
  clampAmount,
  clampHours,
  clampMinutes,
  clampOccurrences,
  formatAdjustedTimeDisplay,
  minutesToIso8601Duration,
  roundAmountToThirdDecimal,
} from "@/lib/goals/goal-event-input";
import {
  getGoalFormValidationErrors,
  isGoalFormValid,
} from "@/lib/goals/goal-form-validation";
import type { CreateGoalInput } from "@/lib/goals/goal.schemas";
import type { GoalPeriod, GoalType } from "@/lib/goals/goal.types";
import { GOAL_PERIOD_FILTER_LABELS } from "@/lib/goals/goal-period-filter";
import { cn } from "@/lib/utils";

type AddGoalDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const fieldClassName = cn(
  "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 h-8 w-full min-w-0 rounded-lg border bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:ring-3 aria-invalid:ring-3 md:text-sm",
);

const sanitizeAmountInput = (value: string): string => {
  const cleaned = value.replace(/[^\d.]/g, "");
  const [whole = "", ...fraction] = cleaned.split(".");
  return fraction.length > 0 ? `${whole}.${fraction.join("")}` : whole;
};

const shouldShowFieldError = (
  field: string,
  touchedFields: ReadonlySet<string>,
  hasAttemptedSubmit: boolean,
): boolean => {
  return touchedFields.has(field) || hasAttemptedSubmit;
};

function FieldError({
  message,
}: Readonly<{
  message: string | undefined;
}>) {
  if (!message) {
    return null;
  }

  return <p className="text-destructive text-sm">{message}</p>;
}

const buildCreateGoalInput = (
  name: string,
  description: string,
  category: GoalCategory | "",
  period: GoalPeriod,
  type: GoalType,
  occurrenceValue: number,
  hoursValue: number,
  minutesValue: number,
  amountValue: number,
): CreateGoalInput => {
  const base = {
    name: name.trim(),
    description: description.trim(),
    category: category === "" ? null : category,
    period,
  };

  if (type === "OCCURANCE") {
    return {
      ...base,
      type,
      target: clampOccurrences(occurrenceValue),
    };
  }

  if (type === "TIME") {
    return {
      ...base,
      type,
      target: minutesToIso8601Duration(hoursValue, minutesValue),
    };
  }

  return {
    ...base,
    type,
    target: roundAmountToThirdDecimal(amountValue),
  };
};

const initialFormState = () => ({
  name: "",
  description: "",
  category: "" as GoalCategory | "",
  type: "" as GoalType | "",
  period: "" as GoalPeriod | "",
  occurrences: "1",
  hours: "0",
  minutes: "0",
  amount: "",
});

function AddGoalForm({ onClose }: Readonly<{ onClose: () => void }>) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(
    () => new Set(),
  );
  const [form, setForm] = useState(initialFormState);

  const occurrenceValue = Number(form.occurrences);
  const hoursValue = Number(form.hours);
  const minutesValue = Number(form.minutes);
  const amountValue = Number(form.amount);

  const validationErrors = useMemo(
    () => getGoalFormValidationErrors(form, { mode: "create" }),
    [form],
  );

  const canSubmit = !isPending && isGoalFormValid(validationErrors);

  const touchField = (field: string) => {
    setTouchedFields((current) => {
      if (current.has(field)) {
        return current;
      }

      const next = new Set(current);
      next.add(field);
      return next;
    });
  };

  const showError = (field: string) =>
    shouldShowFieldError(field, touchedFields, hasAttemptedSubmit);

  const handleSubmit = () => {
    const { type, period } = form;

    setHasAttemptedSubmit(true);

    if (!canSubmit || type === "" || period === "") {
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = await createGoal(
        buildCreateGoalInput(
          form.name,
          form.description,
          form.category,
          period,
          type,
          occurrenceValue,
          hoursValue,
          minutesValue,
          amountValue,
        ),
      );

      if (result.error || !result.goal) {
        setError(result.error ?? "Failed to create goal");
        return;
      }

      setForm(initialFormState());
      onClose();
      router.refresh();
    });
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        handleSubmit();
      }}
    >
      <div className="grid max-h-[min(70vh,32rem)] gap-4 overflow-y-auto px-1.5 py-0.5">
        <div className="grid gap-2">
          <Label htmlFor="goal-name">Name</Label>
          <Input
            id="goal-name"
            value={form.name}
            onChange={(event) =>
              setForm((current) => ({ ...current, name: event.target.value }))
            }
            onBlur={() => touchField("name")}
            aria-invalid={showError("name") && !!validationErrors.name}
            placeholder="e.g. Meditate"
            autoFocus
          />
          <FieldError
            message={showError("name") ? validationErrors.name : undefined}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="goal-description">Description</Label>
          <textarea
            id="goal-description"
            value={form.description}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
            placeholder="Optional details about this goal"
            rows={3}
            className={cn(fieldClassName, "h-auto resize-none py-2")}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="goal-category">Category</Label>
          <select
            id="goal-category"
            value={form.category}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                category: event.target.value as GoalCategory | "",
              }))
            }
            className={fieldClassName}
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
          <Label htmlFor="goal-period">Period</Label>
          <select
            id="goal-period"
            value={form.period}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                period: event.target.value as GoalPeriod | "",
              }))
            }
            onBlur={() => touchField("period")}
            aria-invalid={showError("period") && !!validationErrors.period}
            className={fieldClassName}
          >
            <option value="">Select a period</option>
            {GOAL_PERIODS.map((period) => (
              <option key={period} value={period}>
                {GOAL_PERIOD_FILTER_LABELS[period]}
              </option>
            ))}
          </select>
          <FieldError
            message={showError("period") ? validationErrors.period : undefined}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="goal-type">Type</Label>
          <select
            id="goal-type"
            value={form.type}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                type: event.target.value as GoalType | "",
              }))
            }
            onBlur={() => touchField("type")}
            aria-invalid={showError("type") && !!validationErrors.type}
            className={fieldClassName}
          >
            <option value="">Select a type</option>
            {GOAL_TYPES.map((type) => (
              <option key={type} value={type}>
                {GOAL_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
          <FieldError
            message={showError("type") ? validationErrors.type : undefined}
          />
        </div>

        {form.type === "OCCURANCE" ? (
          <div className="grid gap-2">
            <Label htmlFor="goal-target-occurrences">Target occurrences</Label>
            <NumberStepperInput
              id="goal-target-occurrences"
              aria-label="target occurrences"
              value={form.occurrences}
              onChange={(occurrences) =>
                setForm((current) => ({ ...current, occurrences }))
              }
              min={1}
              max={1000}
              onBlurClamp={clampOccurrences}
            />
            <FieldError
              message={
                showError("target") ? validationErrors.target : undefined
              }
            />
          </div>
        ) : null}

        {form.type === "TIME" ? (
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="goal-target-hours">Target hours</Label>
              <NumberStepperInput
                id="goal-target-hours"
                aria-label="target hours"
                value={form.hours}
                onChange={(hours) =>
                  setForm((current) => ({ ...current, hours }))
                }
                min={0}
                max={100}
                onBlurClamp={clampHours}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="goal-target-minutes">Target minutes</Label>
              <NumberStepperInput
                id="goal-target-minutes"
                aria-label="target minutes"
                value={form.minutes}
                onChange={(minutes) =>
                  setForm((current) => ({ ...current, minutes }))
                }
                min={0}
                max={1000}
                onBlurClamp={clampMinutes}
              />
            </div>

            <p className="text-muted-foreground text-sm">
              Target: {formatAdjustedTimeDisplay(hoursValue, minutesValue)}
            </p>
            <FieldError
              message={
                showError("target") ? validationErrors.target : undefined
              }
            />
          </div>
        ) : null}

        {form.type === "AMOUNT" ? (
          <div className="grid gap-2">
            <Label htmlFor="goal-target-amount">Target amount</Label>
            <Input
              id="goal-target-amount"
              inputMode="decimal"
              aria-label="target amount"
              aria-invalid={showError("target") && !!validationErrors.target}
              value={form.amount}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  amount: sanitizeAmountInput(event.target.value),
                }))
              }
              onBlur={() => {
                touchField("target");

                if (form.amount === "" || form.amount === ".") {
                  return;
                }

                setForm((current) => ({
                  ...current,
                  amount: String(clampAmount(Number(current.amount))),
                }));
              }}
              className="tabular-nums"
            />
            <FieldError
              message={
                showError("target") ? validationErrors.target : undefined
              }
            />
          </div>
        ) : null}

        {error ? <p className="text-destructive text-sm">{error}</p> : null}
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={!canSubmit}>
          Create Goal
        </Button>
      </DialogFooter>
    </form>
  );
}

export function AddGoalDialog({
  open,
  onOpenChange,
}: Readonly<AddGoalDialogProps>) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton className="sm:max-w-md">
        <DialogHeader className="text-center">
          <DialogTitle className="font-bold">Add a Goal</DialogTitle>
        </DialogHeader>

        {open ? (
          <AddGoalForm
            key="add-goal-form"
            onClose={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
