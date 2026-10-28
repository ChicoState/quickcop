import { Module } from "@nestjs/common";

import { WebScraperProductPreviewModule } from "./web-scraper-product-preview/web-scraper-product-preview.module";

@Module({
  imports: [WebScraperProductPreviewModule],
})
export class WebScraperAppModule {}
