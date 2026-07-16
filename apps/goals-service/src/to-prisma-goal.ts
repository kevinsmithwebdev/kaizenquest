import type {
  CreateGoalInput,
  GoalEventInput,
  GoalType,
  UpdateGoalInput,
} from "@kaizen/shared-contracts";

import type { Prisma } from "./generated/prisma/client";

export const toPrismaGoalCreateData = (
  userId: string,
  input: CreateGoalInput,
): Prisma.GoalUncheckedCreateInput => {
  const base = {
    userId,
    name: input.name,
    description: input.description,
    category: input.category ?? null,
    period: input.period,
    type: input.type,
  };

  if (input.type === "OCCURANCE") {
    return {
      ...base,
      targetOccurrences: input.target,
      targetDuration: null,
      targetAmount: null,
    };
  }

  if (input.type === "TIME") {
    return {
      ...base,
      targetOccurrences: null,
      targetDuration: input.target,
      targetAmount: null,
    };
  }

  return {
    ...base,
    targetOccurrences: null,
    targetDuration: null,
    targetAmount: input.target,
  };
};

export const toPrismaGoalUpdateData = (
  input: UpdateGoalInput,
  type: GoalType,
): Prisma.GoalUncheckedUpdateInput => {
  const base = {
    name: input.name,
    description: input.description,
    ...(input.category === undefined ? {} : { category: input.category }),
    period: input.period,
  };

  if (type === "OCCURANCE") {
    return {
      ...base,
      targetOccurrences: input.target as number,
      targetDuration: null,
      targetAmount: null,
    };
  }

  if (type === "TIME") {
    return {
      ...base,
      targetOccurrences: null,
      targetDuration: input.target as string,
      targetAmount: null,
    };
  }

  return {
    ...base,
    targetOccurrences: null,
    targetDuration: null,
    targetAmount: input.target as number,
  };
};

export const toPrismaGoalEventCreateData = (
  goalId: string,
  input: GoalEventInput,
): Prisma.GoalEventUncheckedCreateInput => {
  const base = {
    goalId,
    type: input.type,
    occurredAt: new Date(input.occurredAt),
  };

  if (input.type === "OCCURANCE") {
    return {
      ...base,
      occurrences: input.occurrences,
      duration: null,
      amount: null,
    };
  }

  if (input.type === "TIME") {
    return {
      ...base,
      occurrences: null,
      duration: input.duration,
      amount: null,
    };
  }

  return {
    ...base,
    occurrences: null,
    duration: null,
    amount: input.amount,
  };
};
