import type { Prisma } from "@/lib/generated/prisma/client";

import type { CreateGoalInput, UpdateGoalInput } from "./goal.schemas";
import type { GoalType } from "./goal.types";

export const toPrismaGoalCreateData = (
  userId: string,
  input: CreateGoalInput,
): Prisma.GoalCreateInput => {
  const base = {
    user: { connect: { id: userId } },
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
): Prisma.GoalUpdateInput => {
  const base = {
    name: input.name,
    description: input.description,
    ...(input.category !== undefined ? { category: input.category } : {}),
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
