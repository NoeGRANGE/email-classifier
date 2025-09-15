import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
  Inject,
} from "@nestjs/common";
import { BillingService } from "../services/billing";
import { FastifyRequest } from "fastify";
import { SupabaseAuthGuard } from "src/lib/supabase-auth-guard";
import { stripe } from "./stripe";
import { Supa } from "src/lib/supabase";

const APP_URL = process.env.APP_URL || "http://localhost:3000";

@UseGuards(SupabaseAuthGuard)
@Controller("billing")
export class BillingController {
  constructor(
    private readonly billing: BillingService,
    @Inject("SUPABASE") private readonly supa: Supa
  ) {}

  @Get("me")
  async me(@Req() req: FastifyRequest) {
    const userId = req.user.id;
    return this.billing.getBillingInfo(userId);
  }

  @Get("plans")
  async plans(@Req() req: FastifyRequest) {
    const userId = req.user.id;
    return this.billing.seePlans(userId);
  }

  @Post("checkout")
  async checkout(@Req() req: FastifyRequest, @Body() body: { plan: Plan }) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException();

    const { data: plan } = await this.supa
      .from("billing_prices")
      .select("stripe_price_id")
      .eq("plan", body.plan)
      .single();
    const priceId = plan?.stripe_price_id;
    if (!priceId) throw new Error("Unknown plan");

    const { data: user } = await this.supa
      .from("users")
      .select("auth_user_id, email, stripe_customer_id")
      .eq("auth_user_id", userId)
      .single();

    let customerId = user?.stripe_customer_id as string | null;
    if (customerId) {
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer: customerId,
        line_items: [{ price: priceId, quantity: 1 }],
        subscription_data: { trial_period_days: 14 },
        billing_address_collection: "required",
        tax_id_collection: { enabled: true },
        customer_update: { name: "auto", address: "auto" },
        client_reference_id: userId,
        success_url: `${APP_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${APP_URL}/billing/cancelled`,
        custom_fields: [
          {
            key: "company_name",
            label: { type: "custom", custom: "Company name" },
            type: "text",
            optional: true,
          },
        ],
      });
      return { url: session.url };
    } else {
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [{ price: priceId, quantity: 1 }],
        subscription_data: { trial_period_days: 14 },
        customer_creation: "always",
        customer_email: user.email,
        billing_address_collection: "required",
        tax_id_collection: { enabled: true },
        customer_update: { name: "auto", address: "auto" },
        client_reference_id: userId,
        success_url: `${APP_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${APP_URL}/billing/cancelled`,
        custom_fields: [
          {
            key: "company_name",
            label: { type: "custom", custom: "Company name" },
            type: "text",
            optional: true,
          },
        ],
      });
      return { url: session.url };
    }
  }

  @Post("portal")
  async portal(@Req() req: any) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException();

    const { data: user } = await this.supa
      .from("users")
      .select("stripe_customer_id")
      .eq("auth_user_id", userId)
      .single();

    if (!user?.stripe_customer_id) throw new Error("No Stripe customer");

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: `${APP_URL}/account`,
    });

    return { url: session.url };
  }
}
