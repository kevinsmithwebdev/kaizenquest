"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NumberStepperInput } from "@/components/ui/number-stepper-input";
import {
  clampAmount,
  clampHours,
  clampMinutes,
  clampOccurrences,
  formatAdjustedTimeDisplay,
  sanitizeAmountInput,
} from "@/lib/goals/goal-event-input";
import type { GoalType } from "@/lib/goals/goal.types";

import { GoalFormFieldError } from "./goal-form-shared";

type GoalValueFieldsProps = {
  goalType: GoalType;
  idPrefix: string;
  purpose: "target" | "event";
  occurrences: string;
  hours: string;
  minutes: string;
  amount: string;
  onOccurrencesChange: (value: string) => void;
  onHoursChange: (value: string) => void;
  onMinutesChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  hoursValue: number;
  minutesValue: number;
  valueError?: string;
  showValueError?: boolean;
  onAmountBlur?: () => void;
};

const labels = {
  target: {
    occurrences: "Target occurrences",
    hours: "Target hours",
    minutes: "Target minutes",
    amount: "Target amount",
    timeSummary: "Target",
  },
  event: {
    occurrences: "Occurrences",
    hours: "Hours",
    minutes: "Minutes",
    amount: "Amount",
    timeSummary: "Adjusted",
  },
} as const;

export function GoalValueFields({
  goalType,
  idPrefix,
  purpose,
  occurrences,
  hours,
  minutes,
  amount,
  onOccurrencesChange,
  onHoursChange,
  onMinutesChange,
  onAmountChange,
  hoursValue,
  minutesValue,
  valueError,
  showValueError = false,
  onAmountBlur,
}: Readonly<GoalValueFieldsProps>) {
  const copy = labels[purpose];
  const fieldId = (name: string) => (idPrefix ? `${idPrefix}-${name}` : name);

  if (goalType === "OCCURANCE") {
    return (
      <div className="grid gap-2">
        <Label htmlFor={fieldId("occurrences")}>{copy.occurrences}</Label>
        <NumberStepperInput
          id={fieldId("occurrences")}
          aria-label={copy.occurrences.toLowerCase()}
          aria-invalid={showValueError && !!valueError}
          value={occurrences}
          onChange={onOccurrencesChange}
          min={1}
          max={1000}
          onBlurClamp={clampOccurrences}
        />
        <GoalFormFieldError message={showValueError ? valueError : undefined} />
      </div>
    );
  }

  if (goalType === "TIME") {
    return (
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor={fieldId("hours")}>{copy.hours}</Label>
          <NumberStepperInput
            id={fieldId("hours")}
            aria-label={copy.hours.toLowerCase()}
            value={hours}
            onChange={onHoursChange}
            min={0}
            max={100}
            onBlurClamp={clampHours}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor={fieldId("minutes")}>{copy.minutes}</Label>
          <NumberStepperInput
            id={fieldId("minutes")}
            aria-label={copy.minutes.toLowerCase()}
            value={minutes}
            onChange={onMinutesChange}
            min={0}
            max={1000}
            onBlurClamp={clampMinutes}
          />
        </div>

        <p className="text-muted-foreground text-sm">
          {copy.timeSummary}:{" "}
          {formatAdjustedTimeDisplay(hoursValue, minutesValue)}
        </p>
        <GoalFormFieldError message={showValueError ? valueError : undefined} />
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      <Label htmlFor={fieldId("amount")}>{copy.amount}</Label>
      <Input
        id={fieldId("amount")}
        inputMode="decimal"
        aria-label={copy.amount.toLowerCase()}
        aria-invalid={showValueError && !!valueError}
        value={amount}
        onChange={(event) =>
          onAmountChange(sanitizeAmountInput(event.target.value))
        }
        onBlur={() => {
          onAmountBlur?.();

          if (amount === "" || amount === ".") {
            return;
          }

          onAmountChange(String(clampAmount(Number(amount))));
        }}
        className="tabular-nums"
      />
      <GoalFormFieldError message={showValueError ? valueError : undefined} />
    </div>
  );
}
