import { Module } from "@nestjs/common";
import { SupabaseModule } from "./supabase";
import { HttpModule } from "@nestjs/axios";
import { WebhookEmailController } from "src/controllers/webhook-email";
import { WebhookEmailService } from "src/services/webhook-email";
import { OutlookAuthService } from "src/services/outlook-auth";
import { EmailSubscriptionService } from "src/services/subscription";
import { LLMService } from "src/services/llm";
import { ConfigService } from "src/services/config";
import { ActionsService } from "src/services/actions";
import { ScheduleModule } from "@nestjs/schedule";

@Module({
  imports: [HttpModule, SupabaseModule, ScheduleModule.forRoot()],
  controllers: [WebhookEmailController],
  providers: [
    WebhookEmailService,
    OutlookAuthService,
    EmailSubscriptionService,
    LLMService,
    ConfigService,
    ActionsService,
  ],
})
export class WebhookEmailModule {}
