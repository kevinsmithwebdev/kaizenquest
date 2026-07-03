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
import type { GoalCategory } from "@/lib/goals/goal-categories";
import { GOAL_TYPE_LABELS } from "@/lib/goals/goal.constants";
import {
  clampOccurrences,
  minutesToIso8601Duration,
  roundAmountToThirdDecimal,
} from "@/lib/goals/goal-event-input";
import {
  getGoalFormValidationErrors,
  isGoalFormValid,
} from "@/lib/goals/goal-form-validation";
import { parseIso8601DurationToMinutes } from "@/lib/goals/iso-duration";
import type { UpdateGoalInput } from "@/lib/goals/goal.schemas";
import type { Goal, GoalPeriod } from "@/lib/goals/goal.types";

import { GoalDetailsFields } from "./goal-details-fields";
import { shouldShowGoalFieldError } from "./goal-form-shared";
import { GoalValueFields } from "./goal-value-fields";

type EditGoalDialogProps = {
  goal: Goal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type EditGoalFormProps = {
  goal: Goal;
  onClose: () => void;
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
    shouldShowGoalFieldError(field, touchedFields, hasAttemptedSubmit);

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
        <GoalDetailsFields
          idPrefix="edit-goal"
          name={form.name}
          description={form.description}
          category={form.category}
          period={form.period}
          onNameChange={(name) => setForm((current) => ({ ...current, name }))}
          onDescriptionChange={(description) =>
            setForm((current) => ({ ...current, description }))
          }
          onCategoryChange={(category) =>
            setForm((current) => ({ ...current, category }))
          }
          onPeriodChange={(period) => {
            if (period === "") {
              return;
            }

            setForm((current) => ({ ...current, period }));
          }}
          onNameBlur={() => touchField("name")}
          nameError={validationErrors.name}
          showNameError={showError("name")}
          typeField={
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
          }
        />

        <GoalValueFields
          goalType={goal.type}
          idPrefix="edit-goal-target"
          purpose="target"
          occurrences={form.occurrences}
          hours={form.hours}
          minutes={form.minutes}
          amount={form.amount}
          onOccurrencesChange={(occurrences) =>
            setForm((current) => ({ ...current, occurrences }))
          }
          onHoursChange={(hours) =>
            setForm((current) => ({ ...current, hours }))
          }
          onMinutesChange={(minutes) =>
            setForm((current) => ({ ...current, minutes }))
          }
          onAmountChange={(amount) =>
            setForm((current) => ({ ...current, amount }))
          }
          hoursValue={hoursValue}
          minutesValue={minutesValue}
          valueError={validationErrors.target}
          showValueError={showError("target")}
          onAmountBlur={() => touchField("target")}
        />

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
