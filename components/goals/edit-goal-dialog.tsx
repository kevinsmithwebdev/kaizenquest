"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { updateGoal } from "@/app/actions/goals";
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
import { GOAL_PERIODS, GOAL_TYPE_LABELS } from "@/lib/goals/goal.constants";
import {
  clampAmount,
  clampHours,
  clampMinutes,
  clampOccurrences,
  formatAdjustedTimeDisplay,
  minutesToIso8601Duration,
  roundAmountToThirdDecimal,
} from "@/lib/goals/goal-event-input";
import { parseIso8601DurationToMinutes } from "@/lib/goals/iso-duration";
import {
  getGoalFormValidationErrors,
  isGoalFormValid,
} from "@/lib/goals/goal-form-validation";
import type { UpdateGoalInput } from "@/lib/goals/goal.schemas";
import type { Goal, GoalPeriod } from "@/lib/goals/goal.types";
import { GOAL_PERIOD_FILTER_LABELS } from "@/lib/goals/goal-period-filter";
import { cn } from "@/lib/utils";

type EditGoalDialogProps = {
  goal: Goal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type EditGoalFormProps = {
  goal: Goal;
  onClose: () => void;
};

const fieldClassName = cn(
  "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 h-8 w-full min-w-0 rounded-lg border bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:ring-3 aria-invalid:ring-3 md:text-sm",
);

const sanitizeAmountInput = (value: string): string => {
  const cleaned = value.replace(/[^\d.]/g, "");
  const [whole = "", ...fraction] = cleaned.split(".");
  return fraction.length > 0 ? `${whole}.${fraction.join("")}` : whole;
};

const durationToFormParts = (duration: string) => {
  const totalMinutes = parseIso8601DurationToMinutes(duration);

  return {
    hours: String(Math.floor(totalMinutes / 60)),
    minutes: String(totalMinutes % 60),
  };
};

const goalToFormState = (goal: Goal) => {
  const base = {
    name: goal.name,
    description: goal.description,
    category: (goal.category ?? "") as GoalCategory | "",
    period: goal.period,
    occurrences: "1",
    hours: "0",
    minutes: "0",
    amount: "",
  };

  if (goal.type === "OCCURANCE") {
    return { ...base, occurrences: String(goal.target) };
  }

  if (goal.type === "TIME") {
    const { hours, minutes } = durationToFormParts(goal.target);
    return { ...base, hours, minutes };
  }

  return { ...base, amount: String(goal.target) };
};

type GoalFormState = ReturnType<typeof goalToFormState>;

const isEditGoalFormDirty = (
  goal: Goal,
  form: GoalFormState,
  occurrenceValue: number,
  hoursValue: number,
  minutesValue: number,
  amountValue: number,
): boolean => {
  const initial = goalToFormState(goal);
  const initialInput = buildUpdateGoalInput(
    goal,
    initial.name,
    initial.description,
    initial.category,
    initial.period,
    Number(initial.occurrences),
    Number(initial.hours),
    Number(initial.minutes),
    Number(initial.amount),
  );
  const currentInput = buildUpdateGoalInput(
    goal,
    form.name,
    form.description,
    form.category,
    form.period,
    occurrenceValue,
    hoursValue,
    minutesValue,
    amountValue,
  );

  return JSON.stringify(initialInput) !== JSON.stringify(currentInput);
};

const buildUpdateGoalInput = (
  goal: Goal,
  name: string,
  description: string,
  category: GoalCategory | "",
  period: GoalPeriod,
  occurrenceValue: number,
  hoursValue: number,
  minutesValue: number,
  amountValue: number,
): UpdateGoalInput => {
  const base = {
    id: goal.id,
    name: name.trim(),
    description: description.trim(),
    category: category === "" ? null : category,
    period,
  };

  if (goal.type === "OCCURANCE") {
    return {
      ...base,
      target: clampOccurrences(occurrenceValue),
    };
  }

  if (goal.type === "TIME") {
    return {
      ...base,
      target: minutesToIso8601Duration(hoursValue, minutesValue),
    };
  }

  return {
    ...base,
    target: roundAmountToThirdDecimal(amountValue),
  };
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

function EditGoalForm({ goal, onClose }: Readonly<EditGoalFormProps>) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(
    () => new Set(),
  );
  const [form, setForm] = useState(() => goalToFormState(goal));

  const occurrenceValue = Number(form.occurrences);
  const hoursValue = Number(form.hours);
  const minutesValue = Number(form.minutes);
  const amountValue = Number(form.amount);

  const validationErrors = useMemo(
    () =>
      getGoalFormValidationErrors(
        { ...form, type: goal.type, period: form.period },
        { mode: "edit", goalType: goal.type },
      ),
    [form, goal.type],
  );

  const isValid = isGoalFormValid(validationErrors);

  const isDirty = useMemo(
    () =>
      isEditGoalFormDirty(
        goal,
        form,
        occurrenceValue,
        hoursValue,
        minutesValue,
        amountValue,
      ),
    [goal, form, occurrenceValue, hoursValue, minutesValue, amountValue],
  );

  const canSubmit = !isPending && isValid && isDirty;

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
    setHasAttemptedSubmit(true);

    if (!canSubmit) {
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = await updateGoal(
        buildUpdateGoalInput(
          goal,
          form.name,
          form.description,
          form.category,
          form.period,
          occurrenceValue,
          hoursValue,
          minutesValue,
          amountValue,
        ),
      );

      if (result.error || !result.goal) {
        setError(result.error ?? "Failed to update goal");
        return;
      }

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
          <Label htmlFor="edit-goal-name">Name</Label>
          <Input
            id="edit-goal-name"
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
          <Label htmlFor="edit-goal-description">Description</Label>
          <textarea
            id="edit-goal-description"
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
          <Label htmlFor="edit-goal-category">Category</Label>
          <select
            id="edit-goal-category"
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
          <Label htmlFor="edit-goal-period">Period</Label>
          <select
            id="edit-goal-period"
            value={form.period}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                period: event.target.value as GoalPeriod,
              }))
            }
            className={fieldClassName}
          >
            {GOAL_PERIODS.map((period) => (
              <option key={period} value={period}>
                {GOAL_PERIOD_FILTER_LABELS[period]}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="edit-goal-type">Type</Label>
          <Input
            id="edit-goal-type"
            value={GOAL_TYPE_LABELS[goal.type]}
            readOnly
            tabIndex={-1}
            className="bg-muted/50 text-muted-foreground cursor-default"
          />
        </div>

        {goal.type === "OCCURANCE" ? (
          <div className="grid gap-2">
            <Label htmlFor="edit-goal-target-occurrences">
              Target occurrences
            </Label>
            <NumberStepperInput
              id="edit-goal-target-occurrences"
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

        {goal.type === "TIME" ? (
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-goal-target-hours">Target hours</Label>
              <NumberStepperInput
                id="edit-goal-target-hours"
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
              <Label htmlFor="edit-goal-target-minutes">Target minutes</Label>
              <NumberStepperInput
                id="edit-goal-target-minutes"
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

        {goal.type === "AMOUNT" ? (
          <div className="grid gap-2">
            <Label htmlFor="edit-goal-target-amount">Target amount</Label>
            <Input
              id="edit-goal-target-amount"
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
          Save Changes
        </Button>
      </DialogFooter>
    </form>
  );
}

export function EditGoalDialog({
  goal,
  open,
  onOpenChange,
}: Readonly<EditGoalDialogProps>) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton className="sm:max-w-md">
        <DialogHeader className="text-center">
          <DialogTitle className="font-bold">Edit Goal</DialogTitle>
        </DialogHeader>

        {goal ? (
          <EditGoalForm
            key={goal.id}
            goal={goal}
            onClose={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
