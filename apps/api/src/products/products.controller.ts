import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { ProductsService } from './products.service';

@Controller('products')
@UseGuards(SupabaseAuthGuard)
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  list() {
    return this.products.listWithStock();
  }

  @Get(':id/stock')
  stock(@Param('id') id: string) {
    return this.products.getStock(id);
  }
}