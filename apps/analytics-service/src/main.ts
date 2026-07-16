import "reflect-metadata";
import "dotenv/config";

import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.ANALYTICS_SERVICE_PORT ?? 3004);
  await app.listen(port);
  console.log(`analytics-service listening on http://localhost:${port}`);
}

bootstrap();
