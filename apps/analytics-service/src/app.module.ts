import { Module } from "@nestjs/common";

import { AnalyticsController } from "./analytics.controller";
import { AnalyticsService } from "./analytics.service";
import { GoalEventConsumer } from "./goal-event.consumer";
import { HealthController } from "./health.controller";
import { PrismaService } from "./prisma.service";

@Module({
  controllers: [AnalyticsController, HealthController],
  providers: [AnalyticsService, PrismaService, GoalEventConsumer],
})
export class AppModule {}
