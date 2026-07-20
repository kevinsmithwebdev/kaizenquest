import {
  isPositiveAmountValue,
  isPositiveOccurrenceValue,
  isPositiveTimeValue,
} from "./goal-event-input";
import type { GoalPeriod, GoalType } from "./goal.types";

export type GoalFormValidationErrors = {
  name?: string;
  period?: string;
  type?: string;
  target?: string;
};

type GoalFormValidationInput = {
  name: string;
  period: GoalPeriod | "";
  type: GoalType | "";
  occurrences: string;
  hours: string;
  minutes: string;
  amount: string;
};

const getTargetValidationError = (
  effectiveType: GoalType,
  form: Pick<
    GoalFormValidationInput,
    "occurrences" | "hours" | "minutes" | "amount"
  >,
): string | undefined => {
  const occurrenceValue = Number(form.occurrences);
  const hoursValue = Number(form.hours);
  const minutesValue = Number(form.minutes);
  const amountValue = Number(form.amount);

  if (effectiveType === "OCCURANCE") {
    return isPositiveOccurrenceValue(occurrenceValue)
      ? undefined
      : "Enter a valid target";
  }

  if (effectiveType === "TIME") {
    return isPositiveTimeValue(hoursValue, minutesValue)
      ? undefined
      : "Enter a valid target";
  }

  if (form.amount.trim() === "") {
    return "Target amount is required";
  }

  return isPositiveAmountValue(amountValue)
    ? undefined
    : "Enter a valid target";
};

export const getGoalFormValidationErrors = (
  form: GoalFormValidationInput,
  options: { mode: "create" | "edit"; goalType?: GoalType },
): GoalFormValidationErrors => {
  const errors: GoalFormValidationErrors = {};
  const effectiveType = options.mode === "edit" ? options.goalType : form.type;

  if (form.name.trim().length === 0) {
    errors.name = "Name is required";
  }

  if (options.mode === "create") {
    if (form.period === "") {
      errors.period = "Period is required";
    }

    if (form.type === "") {
      errors.type = "Type is required";
    }
  }

  if (!effectiveType) {
    return errors;
  }

  const targetError = getTargetValidationError(effectiveType, form);
  if (targetError) {
    errors.target = targetError;
  }

  return errors;
};

export const isGoalFormValid = (errors: GoalFormValidationErrors): boolean => {
  return Object.keys(errors).length === 0;
};
