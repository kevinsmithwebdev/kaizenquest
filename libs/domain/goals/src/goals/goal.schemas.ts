import { z } from "zod";

import {
  goalIdSchema,
  iso8601DurationSchema,
  positiveFloatSchema,
  positiveIntSchema,
} from "@kaizen/shared-contracts";

export {
  addGoalEventSchema as addGoalEventWireSchema,
  createGoalSchema,
  goalEventSchema as goalEventWireSchema,
  goalIdSchema,
  iso8601DurationSchema,
  positiveFloatSchema,
  positiveIntSchema,
  updateGoalSchema,
  validateGoalTarget,
  type AddGoalEventInput as AddGoalEventWireInput,
  type CreateGoalInput,
  type GoalEventInput as GoalEventWireInput,
  type GoalType,
  type UpdateGoalInput,
} from "@kaizen/shared-contracts";

/**
 * In-process event schema (coerces ISO strings to Date for Prisma/web).
 * Wire/API contracts use `@kaizen/shared-contracts` goalEventSchema instead.
 */
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

export type GoalEventInput = z.infer<typeof goalEventSchema>;
export type AddGoalEventInput = z.infer<typeof addGoalEventSchema>;
