import { Module } from "@nestjs/common";

import { ProductPreviewModule } from "./product-preview/product-preview.module";

@Module({
  imports: [ProductPreviewModule],
})
export class AppModule {}
