"use client";

import { createElement, useState, useTransition } from "react";
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { NumberStepperInput } from "@/components/ui/number-stepper-input";
import {
  getGoalCategoryColors,
  getGoalCategoryIcon,
} from "@/lib/goals/goal-categories";
import {
  clampAmount,
  clampHours,
  clampMinutes,
  clampOccurrences,
  formatAdjustedTimeDisplay,
  isPositiveAmountValue,
  isPositiveOccurrenceValue,
  isPositiveTimeValue,
  minutesToIso8601Duration,
  roundAmountToThirdDecimal,
} from "@/lib/goals/goal-event-input";
import type { Goal } from "@/lib/goals/goal.types";

type AddEventDialogProps = {
  goal: Goal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type AddEventFormProps = {
  goal: Goal;
  onClose: () => void;
};

const sanitizeAmountInput = (value: string): string => {
  const cleaned = value.replace(/[^\d.]/g, "");
  const [whole = "", ...fraction] = cleaned.split(".");
  return fraction.length > 0 ? `${whole}.${fraction.join("")}` : whole;
};

function EventFormDescription({ goal }: { goal: Goal }) {
  const categoryColors = getGoalCategoryColors(goal.category);
  const categoryIcon = getGoalCategoryIcon(goal.category);
  const goalName = <span className="font-semibold">{goal.name}</span>;

  const description =
    goal.type === "OCCURANCE" ? (
      <>How many times did you perform {goalName}?</>
    ) : goal.type === "TIME" ? (
      <>How much time did you invest in {goalName}?</>
    ) : (
      <>How much did you perform {goalName}?</>
    );

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

function AddEventForm({ goal, onClose }: AddEventFormProps) {
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
    (goal.type === "OCCURANCE"
      ? isPositiveOccurrenceValue(occurrenceValue)
      : goal.type === "TIME"
        ? isPositiveTimeValue(hoursValue, minutesValue)
        : isPositiveAmountValue(amountValue));

  const handleSubmit = () => {
    if (!canSubmit) {
      return;
    }

    setError(null);

    startTransition(async () => {
      const occurredAt = new Date();
      const result =
        goal.type === "OCCURANCE"
          ? await addGoalEvent({
              goalId: goal.id,
              type: "OCCURANCE",
              occurrences: clampOccurrences(occurrenceValue),
              occurredAt,
            })
          : goal.type === "TIME"
            ? await addGoalEvent({
                goalId: goal.id,
                type: "TIME",
                duration: minutesToIso8601Duration(hoursValue, minutesValue),
                occurredAt,
              })
            : await addGoalEvent({
                goalId: goal.id,
                type: "AMOUNT",
                amount: roundAmountToThirdDecimal(amountValue),
                occurredAt,
              });

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

        {goal.type === "OCCURANCE" ? (
          <div className="grid gap-2">
            <Label htmlFor="occurrences">Occurrences</Label>
            <NumberStepperInput
              id="occurrences"
              aria-label="occurrences"
              value={occurrences}
              onChange={setOccurrences}
              min={1}
              max={1000}
              onBlurClamp={clampOccurrences}
            />
          </div>
        ) : null}

        {goal.type === "TIME" ? (
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="hours">Hours</Label>
              <NumberStepperInput
                id="hours"
                aria-label="hours"
                value={hours}
                onChange={setHours}
                min={0}
                max={100}
                onBlurClamp={clampHours}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="minutes">Minutes</Label>
              <NumberStepperInput
                id="minutes"
                aria-label="minutes"
                value={minutes}
                onChange={setMinutes}
                min={0}
                max={1000}
                onBlurClamp={clampMinutes}
              />
            </div>

            <p className="text-muted-foreground text-sm">
              Adjusted: {formatAdjustedTimeDisplay(hoursValue, minutesValue)}
            </p>
          </div>
        ) : null}

        {goal.type === "AMOUNT" ? (
          <div className="grid gap-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              inputMode="decimal"
              aria-label="amount"
              value={amount}
              onChange={(event) =>
                setAmount(sanitizeAmountInput(event.target.value))
              }
              onBlur={() => {
                if (amount === "" || amount === ".") {
                  return;
                }

                setAmount(String(clampAmount(Number(amount))));
              }}
              className="tabular-nums"
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
}: AddEventDialogProps) {
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
