import { Module } from "@nestjs/common";
import { SupabaseModule } from "./supabase";
import { ConfigService } from "src/services/config";
import { ConfigController } from "src/controllers/config";
import { HttpModule } from "@nestjs/axios";

@Module({
  imports: [HttpModule, SupabaseModule],
  controllers: [ConfigController],
  providers: [ConfigService],
})
export class ConfigsModule {}
