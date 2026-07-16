import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import {
  goalEventLoggedEventSchema,
  KAFKA_TOPICS,
} from "@kaizen/shared-contracts";
import { Kafka, type Consumer } from "kafkajs";

import { AnalyticsService } from "./analytics.service";

const getBrokers = (): string[] => {
  const raw = process.env.KAFKA_BROKERS ?? "localhost:9092";
  return raw
    .split(",")
    .map((b) => b.trim())
    .filter(Boolean);
};

@Injectable()
export class GoalEventConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(GoalEventConsumer.name);
  private consumer: Consumer | null = null;

  constructor(private readonly analyticsService: AnalyticsService) {}

  onModuleInit() {
    void this.start();
  }

  async onModuleDestroy() {
    try {
      await this.consumer?.disconnect();
    } catch (error) {
      this.logger.warn(`Kafka consumer disconnect failed: ${String(error)}`);
    }
  }

  private async start() {
    try {
      const kafka = new Kafka({
        clientId: process.env.KAFKA_CLIENT_ID ?? "kaizen-analytics",
        brokers: getBrokers(),
      });

      const consumer = kafka.consumer({
        groupId: process.env.KAFKA_ANALYTICS_GROUP_ID ?? "analytics-service",
      });

      await consumer.connect();
      await consumer.subscribe({
        topic: KAFKA_TOPICS.GOALS_GOAL_EVENT_LOGGED,
        fromBeginning: false,
      });

      this.consumer = consumer;

      void consumer.run({
        eachMessage: async ({ message }) => {
          await this.handleMessage(message.value?.toString());
        },
      });

      this.logger.log(
        `Consuming ${KAFKA_TOPICS.GOALS_GOAL_EVENT_LOGGED}`,
      );
    } catch (error) {
      this.logger.warn(
        `Kafka consumer unavailable; HTTP will still serve: ${String(error)}`,
      );
      this.consumer = null;
    }
  }

  private async handleMessage(raw: string | undefined) {
    if (!raw) {
      return;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      this.logger.warn("Skipping non-JSON Kafka message");
      return;
    }

    const result = goalEventLoggedEventSchema.safeParse(parsed);
    if (!result.success) {
      this.logger.warn("Skipping invalid goal-event-logged payload");
      return;
    }

    const { userId, event } = result.data.payload;
    await this.analyticsService.recordGoalEvent(
      userId,
      new Date(event.occurredAt),
    );
  }
}
