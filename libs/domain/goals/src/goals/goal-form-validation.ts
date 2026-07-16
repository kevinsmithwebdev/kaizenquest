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

  const occurrenceValue = Number(form.occurrences);
  const hoursValue = Number(form.hours);
  const minutesValue = Number(form.minutes);
  const amountValue = Number(form.amount);

  if (effectiveType === "OCCURANCE") {
    if (!isPositiveOccurrenceValue(occurrenceValue)) {
      errors.target = "Enter a valid target";
    }
  } else if (effectiveType === "TIME") {
    if (!isPositiveTimeValue(hoursValue, minutesValue)) {
      errors.target = "Enter a valid target";
    }
  } else if (form.amount.trim() === "") {
    errors.target = "Target amount is required";
  } else if (!isPositiveAmountValue(amountValue)) {
    errors.target = "Enter a valid target";
  }

  return errors;
};

export const isGoalFormValid = (errors: GoalFormValidationErrors): boolean => {
  return Object.keys(errors).length === 0;
};
