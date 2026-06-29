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
    period: input.period,
    type: input.type,
  };

  if (input.type === "OCCURANCE") {
    return {
      ...base,
      targetOccurrences: input.target,
      targetDuration: null,
    };
  }

  return {
    ...base,
    targetOccurrences: null,
    targetDuration: input.target,
  };
};

export const toPrismaGoalUpdateData = (
  input: UpdateGoalInput,
  type: GoalType,
): Prisma.GoalUpdateInput => {
  const base = {
    name: input.name,
    description: input.description,
    period: input.period,
  };

  if (type === "OCCURANCE") {
    return {
      ...base,
      targetOccurrences: input.target as number,
      targetDuration: null,
    };
  }

  return {
    ...base,
    targetOccurrences: null,
    targetDuration: input.target as string,
  };
};
