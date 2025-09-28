import { Injectable, Inject } from "@nestjs/common";
import Stripe from "stripe";
import { Supa } from "src/lib/supabase";

@Injectable()
export class BillingService {
  constructor(@Inject("SUPABASE") private readonly supa: Supa) {}

  async getBillingInfo(userId: string): Promise<BillingInfo> {
    const { data: user } = await this.supa
      .from("users")
      .select(
        "stripe_customer_id,current_plan,current_price_id,subscription_status,current_period_end,organisations(seats_purchased)"
      )
      .eq("auth_user_id", userId)
      .single();

    const { data: emails } = await this.supa
      .from("outlook_credentials")
      .select("id")
      .eq("user_auth_user_id", userId)
      .eq("activated", true);
    const authorizedEmails = user?.organisations?.seats_purchased ?? 0;
    return {
      userId,
      stripeCustomerId: user?.stripe_customer_id ?? null,
      currentPlan: (user?.current_plan as any) ?? null,
      subscriptionStatus: (user?.subscription_status as any) ?? null,
      currentPriceId: user?.current_price_id ?? null,
      currentPeriodEnd: user?.current_period_end ?? null,
      mailboxLimit: authorizedEmails,
      mailboxUsed: emails.length ?? 0,
    };
  }

  async seePlans(userId: string): Promise<PlanInfo[]> {
    const [{ data: plans }, { data: emails }, { data: user }] =
      await Promise.all([
        this.supa
          .from("billing_prices")
          .select("id,stripe_price_id,plan,mailbox_limit")
          .order("mailbox_limit", { ascending: true }),
        this.supa
          .from("outlook_credentials")
          .select("id")
          .eq("user_auth_user_id", userId)
          .eq("activated", true),
        this.supa
          .from("users")
          .select("current_price_id")
          .eq("auth_user_id", userId)
          .single(),
      ]);
    const currentPriceId = user?.current_price_id ?? null;
    const mailboxUsed = emails.length ?? 0;

    return plans.map((p) => ({
      ...p,
      canSwitchTo: p.mailbox_limit >= mailboxUsed,
      isCurrent: p.stripe_price_id === currentPriceId,
    }));
  }

  async upsertFromStripeSub(userId: string, sub: Stripe.Subscription) {
    const priceId = sub.items.data[0].price.id;
    const status = sub.status;
    const currentPeriodEnd = new Date(
      (sub as any).current_period_end * 1000
    ).toISOString();

    // TODO check if possible for the user

    // Map price -> plan
    const { data: map } = await this.supa
      .from("billing_prices")
      .select("plan, mailbox_limit")
      .eq("stripe_price_id", priceId)
      .single();

    await this.supa
      .from("users")
      .update({
        current_price_id: priceId,
        current_plan: (map?.plan ?? "enterprise") as
          | "solo"
          | "team"
          | "business"
          | "enterprise",
        subscription_status: status,
        current_period_end: currentPeriodEnd,
      })
      .eq("auth_user_id", userId);
  }
}
