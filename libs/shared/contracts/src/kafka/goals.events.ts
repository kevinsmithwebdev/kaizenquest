import { z } from "zod";

import {
  goalEventSchema,
  goalIdSchema,
  goalSchema,
} from "../goals/goal.schemas";
import { createKafkaEventEnvelope, kafkaEventEnvelopeSchema } from "./envelope";
import { KAFKA_TOPICS } from "./topics";

export const goalCreatedPayloadSchema = z.object({
  goal: goalSchema,
});

export const goalUpdatedPayloadSchema = z.object({
  goal: goalSchema,
});

export const goalDeletedPayloadSchema = z.object({
  goalId: goalIdSchema,
  userId: z.string().min(1),
});

export const goalEventLoggedPayloadSchema = z.object({
  goalId: goalIdSchema,
  userId: z.string().min(1),
  event: goalEventSchema.and(
    z.object({
      id: z.string().min(1),
    }),
  ),
});

export const goalCreatedEventSchema = kafkaEventEnvelopeSchema.extend({
  eventType: z.literal(KAFKA_TOPICS.GOALS_GOAL_CREATED),
  payload: goalCreatedPayloadSchema,
});

export const goalUpdatedEventSchema = kafkaEventEnvelopeSchema.extend({
  eventType: z.literal(KAFKA_TOPICS.GOALS_GOAL_UPDATED),
  payload: goalUpdatedPayloadSchema,
});

export const goalDeletedEventSchema = kafkaEventEnvelopeSchema.extend({
  eventType: z.literal(KAFKA_TOPICS.GOALS_GOAL_DELETED),
  payload: goalDeletedPayloadSchema,
});

export const goalEventLoggedEventSchema = kafkaEventEnvelopeSchema.extend({
  eventType: z.literal(KAFKA_TOPICS.GOALS_GOAL_EVENT_LOGGED),
  payload: goalEventLoggedPayloadSchema,
});

export type GoalCreatedPayload = z.infer<typeof goalCreatedPayloadSchema>;
export type GoalUpdatedPayload = z.infer<typeof goalUpdatedPayloadSchema>;
export type GoalDeletedPayload = z.infer<typeof goalDeletedPayloadSchema>;
export type GoalEventLoggedPayload = z.infer<
  typeof goalEventLoggedPayloadSchema
>;

export const createGoalCreatedEvent = (
  payload: GoalCreatedPayload,
  options?: { eventId?: string; occurredAt?: string },
) =>
  createKafkaEventEnvelope(KAFKA_TOPICS.GOALS_GOAL_CREATED, payload, options);

export const createGoalUpdatedEvent = (
  payload: GoalUpdatedPayload,
  options?: { eventId?: string; occurredAt?: string },
) =>
  createKafkaEventEnvelope(KAFKA_TOPICS.GOALS_GOAL_UPDATED, payload, options);

export const createGoalDeletedEvent = (
  payload: GoalDeletedPayload,
  options?: { eventId?: string; occurredAt?: string },
) =>
  createKafkaEventEnvelope(KAFKA_TOPICS.GOALS_GOAL_DELETED, payload, options);

export const createGoalEventLoggedEvent = (
  payload: GoalEventLoggedPayload,
  options?: { eventId?: string; occurredAt?: string },
) =>
  createKafkaEventEnvelope(
    KAFKA_TOPICS.GOALS_GOAL_EVENT_LOGGED,
    payload,
    options,
  );
