import { z } from "zod";

import { GOAL_PERIODS, GOAL_TYPES } from "./goal.constants";
import { iso8601DurationSchema } from "./iso-duration";

const goalPeriodSchema = z.enum(GOAL_PERIODS);
const goalTypeSchema = z.enum(GOAL_TYPES);

const positiveIntSchema = z.number().int().positive();

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
]);

export const createGoalSchema = z.discriminatedUnion("type", [
  z.object({
    name: z.string().trim().min(1, "Name is required"),
    description: z.string().trim().default(""),
    period: goalPeriodSchema,
    type: z.literal("OCCURANCE"),
    target: positiveIntSchema,
  }),
  z.object({
    name: z.string().trim().min(1, "Name is required"),
    description: z.string().trim().default(""),
    period: goalPeriodSchema,
    type: z.literal("TIME"),
    target: iso8601DurationSchema,
  }),
]);

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type GoalEventInput = z.infer<typeof goalEventSchema>;
