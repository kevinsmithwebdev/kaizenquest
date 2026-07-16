import "reflect-metadata";
import "dotenv/config";

import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const webOrigins = (process.env.WEB_ORIGIN ?? "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: webOrigins.length === 1 ? webOrigins[0] : webOrigins,
  });

  const port = Number(process.env.PORT ?? process.env.GATEWAY_PORT ?? 3003);
  await app.listen(port);
  console.log(`api-gateway listening on http://localhost:${port}`);
}

bootstrap();
