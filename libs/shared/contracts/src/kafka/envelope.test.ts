import { describe, expect, it } from "vitest";

import {
  KAFKA_TOPICS,
  createUserRegisteredEvent,
  kafkaEventEnvelopeSchema,
  parseKafkaEvent,
  userRegisteredEventSchema,
} from "../index";

describe("kafkaEventEnvelopeSchema", () => {
  it("round-trips through JSON", () => {
    const envelope = {
      eventId: "evt-1",
      eventType: KAFKA_TOPICS.AUTH_USER_REGISTERED,
      occurredAt: "2026-07-16T12:00:00.000Z",
      payload: { userId: "user-1", email: "ada@example.com", name: "Ada" },
    };

    const json = JSON.stringify(envelope);
    const parsed = parseKafkaEvent(userRegisteredEventSchema, JSON.parse(json));

    expect(parsed.eventId).toBe("evt-1");
    expect(parsed.payload.email).toBe("ada@example.com");
  });

  it("rejects envelopes missing eventId", () => {
    const result = kafkaEventEnvelopeSchema.safeParse({
      eventType: "test",
      occurredAt: "2026-07-16T12:00:00.000Z",
      payload: {},
    });

    expect(result.success).toBe(false);
  });
});

describe("createUserRegisteredEvent", () => {
  it("builds a typed auth event", () => {
    const event = createUserRegisteredEvent({
      userId: "user-1",
      email: "ada@example.com",
      name: "Ada",
    });

    expect(event.eventType).toBe(KAFKA_TOPICS.AUTH_USER_REGISTERED);
    expect(userRegisteredEventSchema.safeParse(event).success).toBe(true);
  });
});
