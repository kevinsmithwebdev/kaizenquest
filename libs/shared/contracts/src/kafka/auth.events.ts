import { z } from "zod";

import { createKafkaEventEnvelope, kafkaEventEnvelopeSchema } from "./envelope";
import { KAFKA_TOPICS } from "./topics";

export const userRegisteredPayloadSchema = z.object({
  userId: z.string().min(1),
  email: z.string().email(),
  name: z.string().min(1),
});

export const userRegisteredEventSchema = kafkaEventEnvelopeSchema.extend({
  eventType: z.literal(KAFKA_TOPICS.AUTH_USER_REGISTERED),
  payload: userRegisteredPayloadSchema,
});

export type UserRegisteredPayload = z.infer<typeof userRegisteredPayloadSchema>;
export type UserRegisteredEvent = z.infer<typeof userRegisteredEventSchema>;

export const createUserRegisteredEvent = (
  payload: UserRegisteredPayload,
  options?: { eventId?: string; occurredAt?: string },
) =>
  createKafkaEventEnvelope(KAFKA_TOPICS.AUTH_USER_REGISTERED, payload, options);
