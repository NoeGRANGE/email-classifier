import { Injectable, Logger, Inject } from "@nestjs/common";
import { Supa } from "src/lib/supabase";
import Stripe from "stripe";
import { stripe } from "../controllers/stripe";

@Injectable()
export class StripeWebhookService {
  private readonly log = new Logger(StripeWebhookService.name);

  constructor(@Inject("SUPABASE") private readonly supa: Supa) {}

  async handleEvent(event: Stripe.Event) {
    const { error: dedupErr } = await this.supa
      .from("stripe_events")
      .insert({ id: event.id, type: event.type })
      .select()
      .single();
    if (dedupErr && dedupErr.code !== "23505") {
      this.log.error(`Dedup insert failed: ${dedupErr.message}`);
      return;
    }
    if (!dedupErr) {
      this.log.log(`Processing ${event.type} (${event.id})`);
    } else {
      this.log.log(`Skip duplicate ${event.type} (${event.id})`);
      return;
    }

    switch (event.type) {
      case "checkout.session.completed":
        await this.onCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;

      case "customer.subscription.created":
      case "customer.subscription.updated":
        await this.onSubscriptionUpdated(
          event.data.object as Stripe.Subscription
        );
        break;

      case "customer.subscription.deleted":
        await this.onSubscriptionDeleted(
          event.data.object as Stripe.Subscription
        );
        break;

      case "invoice.payment_failed":
        await this.onPaymentFailed(event.data.object as Stripe.Invoice);
        break;

      // case "invoice.payment_succeeded":
      //   await this.onPaymentSucceeded(event.data.object as Stripe.Invoice);
      //   break;

      case "customer.subscription.trial_will_end":
        // optional: notify user
        break;

      default:
        // ignore others for now
        break;
    }
  }

  private async onCheckoutSessionCompleted(s: Stripe.Checkout.Session) {
    const subId = s.subscription as string;
    const customerId = s.customer as string;
    const userId = s.client_reference_id as string; // you set this when creating Checkout Session

    const sub = await stripe.subscriptions.retrieve(subId);
    const priceId = sub.items.data[0].price.id;
    const status = sub.status;

    let periodEndSec: number | undefined =
      (sub as any).current_period_end ?? (sub as any).trial_end ?? undefined;

    if (!periodEndSec && sub.latest_invoice) {
      try {
        const invoice = await stripe.invoices.retrieve(
          sub.latest_invoice as string
        );
        const firstLine = invoice.lines?.data?.[0];
        periodEndSec = firstLine?.period?.end;
      } catch (e) {
        this.log.warn(
          `Could not retrieve invoice for period end: ${(e as Error).message}`
        );
      }
    }

    const currentPeriodEnd = periodEndSec
      ? new Date(periodEndSec * 1000).toISOString()
      : null;

    const { data: priceMap, error: mapErr } = await this.supa
      .from("billing_prices")
      .select("plan, mailbox_limit")
      .eq("stripe_price_id", priceId)
      .single();

    if (mapErr)
      throw new Error(`Unknown priceId ${priceId}: ${mapErr.message}`);

    const { error: upErr } = await this.supa
      .from("users")
      .update({
        stripe_customer_id: customerId,
        current_price_id: priceId,
        current_plan: priceMap.plan,
        subscription_status: status,
        current_period_end: currentPeriodEnd,
      })
      .eq("auth_user_id", userId);
    if (upErr) throw new Error(`User update failed: ${upErr.message}`);
  }

  private async onSubscriptionUpdated(sub: Stripe.Subscription) {
    const customerId = sub.customer as string;
    const priceId = sub.items.data[0].price.id;
    const status = sub.status;

    let periodEndSec: number | undefined =
      (sub as any).current_period_end ?? (sub as any).trial_end ?? undefined;

    if (!periodEndSec && sub.latest_invoice) {
      try {
        const invoice = await stripe.invoices.retrieve(
          sub.latest_invoice as string
        );
        const firstLine = invoice.lines?.data?.[0];
        periodEndSec = firstLine?.period?.end;
      } catch (e) {
        this.log.warn(
          `Could not retrieve invoice for period end: ${(e as Error).message}`
        );
      }
    }

    const currentPeriodEnd = periodEndSec
      ? new Date(periodEndSec * 1000).toISOString()
      : null;

    const { data: users, error: uErr } = await this.supa
      .from("users")
      .select("auth_user_id")
      .eq("stripe_customer_id", customerId)
      .limit(1);
    if (uErr || !users?.[0]) return;

    const userId = users[0].auth_user_id;

    const { data: priceMap } = await this.supa
      .from("billing_prices")
      .select("plan")
      .eq("stripe_price_id", priceId)
      .single();

    await this.supa
      .from("users")
      .update({
        current_price_id: priceId,
        current_plan: priceMap?.plan ?? null,
        subscription_status: status,
        current_period_end: currentPeriodEnd,
      })
      .eq("auth_user_id", userId);
  }

  private async onSubscriptionDeleted(sub: Stripe.Subscription) {
    const customerId = sub.customer as string;

    const { data: users } = await this.supa
      .from("users")
      .select("auth_user_id")
      .eq("stripe_customer_id", customerId)
      .limit(1);

    if (!users?.[0]) return;

    await this.supa
      .from("users")
      .update({
        subscription_status: "canceled",
        // keep plan/price until end-of-period if you want to allow grace period
      })
      .eq("auth_user_id", users[0].auth_user_id);
  }

  private async onPaymentFailed(inv: Stripe.Invoice) {
    const customerId = inv.customer as string;

    const { data: users } = await this.supa
      .from("users")
      .select("auth_user_id")
      .eq("stripe_customer_id", customerId)
      .limit(1);

    if (!users?.[0]) return;

    await this.supa
      .from("users")
      .update({ subscription_status: "past_due" })
      .eq("auth_user_id", users[0].auth_user_id);
  }
}
