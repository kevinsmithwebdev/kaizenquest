import type { UpdateGoalInput } from "./goal.schemas";

export const isUpdateGoalInputEqual = (
  a: UpdateGoalInput,
  b: UpdateGoalInput,
): boolean =>
  a.id === b.id &&
  a.name === b.name &&
  a.description === b.description &&
  a.period === b.period &&
  a.category === b.category &&
  a.target === b.target;
