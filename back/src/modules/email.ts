import { Module } from "@nestjs/common";
import { SupabaseModule } from "./supabase";
import { EmailService } from "src/services/email";
import { EmailController } from "src/controllers/emails";
import { OutlookAuthService } from "src/services/outlook-auth";
import { HttpModule } from "@nestjs/axios";

@Module({
  imports: [HttpModule, SupabaseModule],
  controllers: [EmailController],
  providers: [EmailService, OutlookAuthService],
})
export class EmailModule {}
