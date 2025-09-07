import { Module } from "@nestjs/common";
import { SupabaseProvider } from "../lib/supabase";

@Module({
  providers: [SupabaseProvider],
  exports: [SupabaseProvider],
})
export class SupabaseModule {}
