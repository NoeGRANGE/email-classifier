import { Module } from "@nestjs/common";
import { SupabaseModule } from "./supabase";
import { ConfigService } from "src/services/config";
import { ConfigController } from "src/controllers/config";
import { HttpModule } from "@nestjs/axios";
import { OutlookAuthService } from "src/services/outlook-auth";

@Module({
  imports: [HttpModule, SupabaseModule],
  controllers: [ConfigController],
  providers: [ConfigService, OutlookAuthService],
})
export class ConfigsModule {}
