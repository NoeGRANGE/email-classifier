import { Module } from "@nestjs/common";
import { BillingService } from "../services/billing";
import { BillingController } from "../controllers/billing";
import { StripeWebhookController } from "../controllers/stripe";
import { StripeWebhookService } from "../services/stripe";
import { SupabaseModule } from "./supabase";
import { BrevoService } from "src/services/brevo";

@Module({
  imports: [SupabaseModule],
  controllers: [BillingController, StripeWebhookController],
  providers: [BillingService, StripeWebhookService, BrevoService],
})
export class BillingModule {}
