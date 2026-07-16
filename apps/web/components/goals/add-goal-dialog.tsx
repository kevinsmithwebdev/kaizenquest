"use client";

import { useMemo, useState, useTransition } from "react";

import { createGoal } from "@/app/actions/goals";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import type { GoalCategory } from "@/lib/goals/goal-categories";
import { GOAL_TYPE_LABELS, GOAL_TYPES } from "@/lib/goals/goal.constants";
import {
  clampOccurrences,
  minutesToIso8601Duration,
  roundAmountToThirdDecimal,
} from "@/lib/goals/goal-event-input";
import {
  getGoalFormValidationErrors,
  isGoalFormValid,
} from "@/lib/goals/goal-form-validation";
import type { CreateGoalInput } from "@/lib/goals/goal.schemas";
import type { GoalPeriod, GoalType } from "@/lib/goals/goal.types";
import { matchGoalType } from "@/lib/goals/match-goal-type";

import { GoalDetailsFields } from "./goal-details-fields";
import {
  GoalFormFieldError,
  goalFormFieldClassName,
  shouldShowGoalFieldError,
} from "./goal-form-shared";
import { GoalValueFields } from "./goal-value-fields";

type AddGoalDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

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

  return matchGoalType<CreateGoalInput>(type, {
    OCCURANCE: () => ({
      ...base,
      type: "OCCURANCE",
      target: clampOccurrences(occurrenceValue),
    }),
    TIME: () => ({
      ...base,
      type: "TIME",
      target: minutesToIso8601Duration(hoursValue, minutesValue),
    }),
    AMOUNT: () => ({
      ...base,
      type: "AMOUNT",
      target: roundAmountToThirdDecimal(amountValue),
    }),
  });
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
    shouldShowGoalFieldError(field, touchedFields, hasAttemptedSubmit);

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
          idPrefix="goal"
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
          onPeriodChange={(period) =>
            setForm((current) => ({ ...current, period }))
          }
          onNameBlur={() => touchField("name")}
          onPeriodBlur={() => touchField("period")}
          nameError={validationErrors.name}
          periodError={validationErrors.period}
          showNameError={showError("name")}
          showPeriodError={showError("period")}
          periodAllowEmpty
          autoFocusName
          typeField={
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
                className={goalFormFieldClassName}
              >
                <option value="">Select a type</option>
                {GOAL_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {GOAL_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
              <GoalFormFieldError
                message={showError("type") ? validationErrors.type : undefined}
              />
            </div>
          }
        />

        {form.type ? (
          <GoalValueFields
            goalType={form.type}
            idPrefix="goal-target"
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
