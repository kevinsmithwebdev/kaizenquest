import { Module } from "@nestjs/common";

import { GoalsController } from "./goals.controller";
import { GoalsService } from "./goals.service";
import { HealthController } from "./health.controller";
import { PrismaService } from "./prisma.service";

@Module({
  controllers: [GoalsController, HealthController],
  providers: [GoalsService, PrismaService],
})
export class AppModule {}
