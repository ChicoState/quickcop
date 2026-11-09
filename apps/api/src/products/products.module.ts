import { Module } from '@nestjs/common';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { SupabaseModule } from '../supabase/supabase.module';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  imports: [SupabaseModule],
  controllers: [ProductsController],
  providers: [ProductsService, SupabaseAuthGuard],
})
export class ProductsModule {}
