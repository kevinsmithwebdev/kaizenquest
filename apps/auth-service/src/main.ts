import "reflect-metadata";
import "dotenv/config";

import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.AUTH_SERVICE_PORT ?? 3001);
  await app.listen(port);
  console.log(`auth-service listening on http://localhost:${port}`);
}

bootstrap();
