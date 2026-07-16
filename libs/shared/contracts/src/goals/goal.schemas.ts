import { z } from "zod";

import { GOAL_CATEGORIES, GOAL_PERIODS, type GoalType } from "./goal.constants";
import { isIso8601Duration } from "./iso-duration";

export const iso8601DurationSchema = z
  .string()
  .refine(
    isIso8601Duration,
    "Enter a valid ISO 8601 duration (e.g. PT2H, PT30M)",
  );

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

/** Wire-format goal event (ISO datetime strings). */
export const goalEventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("OCCURANCE"),
    occurrences: positiveIntSchema,
    occurredAt: z.string().datetime(),
  }),
  z.object({
    type: z.literal("TIME"),
    duration: iso8601DurationSchema,
    occurredAt: z.string().datetime(),
  }),
  z.object({
    type: z.literal("AMOUNT"),
    amount: positiveFloatSchema,
    occurredAt: z.string().datetime(),
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

const goalEventResponseSchema = z.discriminatedUnion("type", [
  z.object({
    id: z.string().min(1),
    type: z.literal("OCCURANCE"),
    occurrences: positiveIntSchema,
    occurredAt: z.string().datetime(),
  }),
  z.object({
    id: z.string().min(1),
    type: z.literal("TIME"),
    duration: iso8601DurationSchema,
    occurredAt: z.string().datetime(),
  }),
  z.object({
    id: z.string().min(1),
    type: z.literal("AMOUNT"),
    amount: positiveFloatSchema,
    occurredAt: z.string().datetime(),
  }),
]);

const goalBaseFields = {
  id: z.string().min(1),
  userId: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  category: goalCategorySchema,
  period: goalPeriodSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  history: z.array(goalEventResponseSchema),
};

export const goalSchema = z.discriminatedUnion("type", [
  z.object({
    ...goalBaseFields,
    type: z.literal("OCCURANCE"),
    target: positiveIntSchema,
  }),
  z.object({
    ...goalBaseFields,
    type: z.literal("TIME"),
    target: iso8601DurationSchema,
  }),
  z.object({
    ...goalBaseFields,
    type: z.literal("AMOUNT"),
    target: positiveFloatSchema,
  }),
]);

export const goalsListResponseSchema = z.object({
  goals: z.array(goalSchema),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
export type GoalEventInput = z.infer<typeof goalEventSchema>;
export type AddGoalEventInput = z.infer<typeof addGoalEventSchema>;
export type GoalEvent = z.infer<typeof goalEventResponseSchema>;
export type Goal = z.infer<typeof goalSchema>;

export const validateGoalTarget = (type: GoalType, target: unknown) => {
  if (type === "OCCURANCE") {
    return positiveIntSchema.safeParse(target);
  }

  if (type === "TIME") {
    return iso8601DurationSchema.safeParse(target);
  }

  return positiveFloatSchema.safeParse(target);
};
