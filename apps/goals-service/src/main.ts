import "reflect-metadata";
import "dotenv/config";

import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = Number(
    process.env.PORT ?? process.env.GOALS_SERVICE_PORT ?? 3002,
  );
  await app.listen(port);
  console.log(`goals-service listening on http://localhost:${port}`);
}

bootstrap();
