import "reflect-metadata";

import { NestFactory } from "@nestjs/core";

import { WebScraperAppModule } from "./web-scraper-app.module";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(WebScraperAppModule);

  app.enableCors();

  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3001);
}

void bootstrap();
