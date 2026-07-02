import { z } from "zod";

import { GOAL_CATEGORIES } from "./goal-categories";
import { GOAL_PERIODS, GOAL_TYPES } from "./goal.constants";
import type { GoalType } from "./goal.types";
import { iso8601DurationSchema } from "./iso-duration";

const goalPeriodSchema = z.enum(GOAL_PERIODS);
const goalCategorySchema = z.enum(GOAL_CATEGORIES).nullable();

export const positiveIntSchema = z.number().int().positive();

export const positiveFloatSchema = z.number().positive();

export const goalIdSchema = z.string().trim().min(1, "Goal ID is required");

export const updateGoalSchema = z.object({
  id: goalIdSchema,
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().default(""),
  category: goalCategorySchema.optional(),
  period: goalPeriodSchema,
  target: z.union([
    positiveIntSchema,
    iso8601DurationSchema,
    positiveFloatSchema,
  ]),
});

export const goalEventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("OCCURANCE"),
    occurrences: positiveIntSchema,
    occurredAt: z.coerce.date(),
  }),
  z.object({
    type: z.literal("TIME"),
    duration: iso8601DurationSchema,
    occurredAt: z.coerce.date(),
  }),
  z.object({
    type: z.literal("AMOUNT"),
    amount: positiveFloatSchema,
    occurredAt: z.coerce.date(),
  }),
]);

export const addGoalEventSchema = z
  .object({
    goalId: goalIdSchema,
  })
  .and(goalEventSchema);

export const createGoalSchema = z.discriminatedUnion("type", [
  z.object({
    name: z.string().trim().min(1, "Name is required"),
    description: z.string().trim().default(""),
    category: goalCategorySchema.optional(),
    period: goalPeriodSchema,
    type: z.literal("OCCURANCE"),
    target: positiveIntSchema,
  }),
  z.object({
    name: z.string().trim().min(1, "Name is required"),
    description: z.string().trim().default(""),
    category: goalCategorySchema.optional(),
    period: goalPeriodSchema,
    type: z.literal("TIME"),
    target: iso8601DurationSchema,
  }),
  z.object({
    name: z.string().trim().min(1, "Name is required"),
    description: z.string().trim().default(""),
    category: goalCategorySchema.optional(),
    period: goalPeriodSchema,
    type: z.literal("AMOUNT"),
    target: positiveFloatSchema,
  }),
]);

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
export type GoalEventInput = z.infer<typeof goalEventSchema>;
export type AddGoalEventInput = z.infer<typeof addGoalEventSchema>;

export const validateGoalTarget = (type: GoalType, target: unknown) => {
  if (type === "OCCURANCE") {
    return positiveIntSchema.safeParse(target);
  }

  if (type === "TIME") {
    return iso8601DurationSchema.safeParse(target);
  }

  return positiveFloatSchema.safeParse(target);
};
