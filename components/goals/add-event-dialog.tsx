"use client";

import { createElement, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { addGoalEvent } from "@/app/actions/goals";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getGoalCategoryColors,
  getGoalCategoryIcon,
} from "@/lib/goals/goal-categories";
import {
  clampOccurrences,
  isPositiveAmountValue,
  isPositiveOccurrenceValue,
  isPositiveTimeValue,
  minutesToIso8601Duration,
  roundAmountToThirdDecimal,
} from "@/lib/goals/goal-event-input";
import type { Goal } from "@/lib/goals/goal.types";

import { GoalValueFields } from "./goal-value-fields";

type AddEventDialogProps = {
  goal: Goal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type AddEventFormProps = {
  goal: Goal;
  onClose: () => void;
};

function getEventFormDescription(goal: Goal): ReactNode {
  const goalName = <span className="font-semibold">{goal.name}</span>;

  if (goal.type === "OCCURANCE") {
    return <>How many times did you perform {goalName}?</>;
  }

  if (goal.type === "TIME") {
    return <>How much time did you invest in {goalName}?</>;
  }

  return <>How much did you perform {goalName}?</>;
}

function EventFormDescription({ goal }: Readonly<{ goal: Goal }>) {
  const categoryColors = getGoalCategoryColors(goal.category);
  const categoryIcon = getGoalCategoryIcon(goal.category);
  const description = getEventFormDescription(goal);

  return (
    <div className="flex items-start gap-2">
      {createElement(categoryIcon, {
        className: "mt-0.5 size-4 shrink-0",
        style: { color: categoryColors.icon },
        strokeWidth: 1.75,
        "aria-hidden": true,
      })}
      <p className="text-foreground text-sm leading-snug">{description}</p>
    </div>
  );
}

function canSubmitGoalEvent(
  goal: Goal,
  occurrenceValue: number,
  hoursValue: number,
  minutesValue: number,
  amountValue: number,
): boolean {
  if (goal.type === "OCCURANCE") {
    return isPositiveOccurrenceValue(occurrenceValue);
  }

  if (goal.type === "TIME") {
    return isPositiveTimeValue(hoursValue, minutesValue);
  }

  return isPositiveAmountValue(amountValue);
}

async function submitGoalEvent(
  goal: Goal,
  occurrenceValue: number,
  hoursValue: number,
  minutesValue: number,
  amountValue: number,
) {
  const occurredAt = new Date();

  if (goal.type === "OCCURANCE") {
    return addGoalEvent({
      goalId: goal.id,
      type: "OCCURANCE",
      occurrences: clampOccurrences(occurrenceValue),
      occurredAt,
    });
  }

  if (goal.type === "TIME") {
    return addGoalEvent({
      goalId: goal.id,
      type: "TIME",
      duration: minutesToIso8601Duration(hoursValue, minutesValue),
      occurredAt,
    });
  }

  return addGoalEvent({
    goalId: goal.id,
    type: "AMOUNT",
    amount: roundAmountToThirdDecimal(amountValue),
    occurredAt,
  });
}

function AddEventForm({ goal, onClose }: Readonly<AddEventFormProps>) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [occurrences, setOccurrences] = useState("1");
  const [hours, setHours] = useState("0");
  const [minutes, setMinutes] = useState("0");
  const [amount, setAmount] = useState("");

  const occurrenceValue = Number(occurrences);
  const hoursValue = Number(hours);
  const minutesValue = Number(minutes);
  const amountValue = Number(amount);

  const canSubmit =
    !isPending &&
    canSubmitGoalEvent(
      goal,
      occurrenceValue,
      hoursValue,
      minutesValue,
      amountValue,
    );

  const handleSubmit = () => {
    if (!canSubmit) {
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = await submitGoalEvent(
        goal,
        occurrenceValue,
        hoursValue,
        minutesValue,
        amountValue,
      );

      if (result.error || !result.goal) {
        setError(result.error ?? "Failed to add event");
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
      <div className="grid gap-4">
        <EventFormDescription goal={goal} />

        <GoalValueFields
          goalType={goal.type}
          idPrefix=""
          purpose="event"
          occurrences={occurrences}
          hours={hours}
          minutes={minutes}
          amount={amount}
          onOccurrencesChange={setOccurrences}
          onHoursChange={setHours}
          onMinutesChange={setMinutes}
          onAmountChange={setAmount}
          hoursValue={hoursValue}
          minutesValue={minutesValue}
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
          Submit
        </Button>
      </DialogFooter>
    </form>
  );
}

export function AddEventDialog({
  goal,
  open,
  onOpenChange,
}: Readonly<AddEventDialogProps>) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton className="sm:max-w-md">
        <DialogHeader className="text-center">
          <DialogTitle className="font-bold">Enter an Event</DialogTitle>
        </DialogHeader>

        {goal ? (
          <AddEventForm
            key={goal.id}
            goal={goal}
            onClose={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
