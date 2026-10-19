import { Module } from "@nestjs/common";
import { AccountModule } from "./account/account.module";
import { SupabaseModule } from "./supabase/supabase.module";

@Module({
  imports: [SupabaseModule, AccountModule],
})
export class AppModule {}