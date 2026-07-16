import { Module } from "@nestjs/common";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { HealthController } from "./health.controller";
import { PrismaService } from "./prisma.service";

@Module({
  controllers: [AuthController, HealthController],
  providers: [AuthService, PrismaService],
})
export class AppModule {}
