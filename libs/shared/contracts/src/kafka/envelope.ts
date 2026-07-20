import { z } from "zod";

export const kafkaEventEnvelopeSchema = z.object({
  eventId: z.string().min(1),
  eventType: z.string().min(1),
  occurredAt: z.iso.datetime(),
  payload: z.unknown(),
});

export type KafkaEventEnvelope = z.infer<typeof kafkaEventEnvelopeSchema>;

export const parseKafkaEvent = <T extends z.ZodType>(
  schema: T,
  data: unknown,
): z.infer<T> => schema.parse(data);

export const createKafkaEventEnvelope = <T>(
  eventType: string,
  payload: T,
  options?: { eventId?: string; occurredAt?: string },
): KafkaEventEnvelope & { payload: T } => ({
  eventId: options?.eventId ?? crypto.randomUUID(),
  eventType,
  occurredAt: options?.occurredAt ?? new Date().toISOString(),
  payload,
});
