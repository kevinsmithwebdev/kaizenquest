import { Module } from "@nestjs/common";

import { AnalyticsController } from "./analytics.controller";
import { AnalyticsService } from "./analytics.service";
import { GoalEventConsumer } from "./goal-event.consumer";
import { PrismaService } from "./prisma.service";

@Module({
  controllers: [AnalyticsController],
  providers: [AnalyticsService, PrismaService, GoalEventConsumer],
})
export class AppModule {}
