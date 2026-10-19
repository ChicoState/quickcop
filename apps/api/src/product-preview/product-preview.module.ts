import { Module } from "@nestjs/common";

import { ProductPreviewController } from "./product-preview.controller";
import { ProductPreviewService } from "./product-preview.service";

@Module({
  controllers: [ProductPreviewController],
  providers: [ProductPreviewService],
})
export class ProductPreviewModule {}
