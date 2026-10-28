import "reflect-metadata";

import { NestFactory } from "@nestjs/core";

import { WebScraperAppModule } from "./web-scraper-app.module";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(WebScraperAppModule);
  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3000);
}

void bootstrap();
