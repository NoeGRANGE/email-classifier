import { Module } from "@nestjs/common";
import { SupabaseModule } from "./supabase";
import { HttpModule } from "@nestjs/axios";
import { WebhookEmailController } from "src/controllers/webhook-email";
import { WebhookEmailService } from "src/services/webhook-email";
import { OutlookAuthService } from "src/services/outlook-auth";
import { EmailSubscriptionService } from "src/services/subscription";

@Module({
  imports: [HttpModule, SupabaseModule],
  controllers: [WebhookEmailController],
  providers: [
    WebhookEmailService,
    OutlookAuthService,
    EmailSubscriptionService,
  ],
})
export class WebhookEmailModule {}
