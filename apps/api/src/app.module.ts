import { Module } from '@nestjs/common';
import { AccountModule } from './account/account.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SupabaseModule } from './supabase/supabase.module';

@Module({
  imports: [SupabaseModule, AccountModule, NotificationsModule],
})
export class AppModule {}
