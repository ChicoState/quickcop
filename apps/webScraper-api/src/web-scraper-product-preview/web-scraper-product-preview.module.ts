import { Module } from "@nestjs/common";

import { WebScraperProductPreviewController } from "./web-scraper-product-preview.controller";
import { WebScraperProductPreviewService } from "./web-scraper-product-preview.service";

@Module({
  controllers: [WebScraperProductPreviewController],
  providers: [WebScraperProductPreviewService],
})
export class WebScraperProductPreviewModule {}
