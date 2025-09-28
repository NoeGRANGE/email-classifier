export {};

declare global {
  type OrganisationData = {
    name: string;
    seatsPurchased: number;
    seatsUsed: number;
    members: {
      id: number;
      email: string;
      role: string;
      status: string;
      authorizedEmails: number;
      createdAt: string;
      acceptedAt: string;
    }[];
  };
  type RegisterResult = {
    ok: boolean;
    user: {
      auth_user_id: string;
      email: string;
      org_id: number;
    };
  };

  // Billing
  type PlanInfo = {
    canSwitchTo: boolean;
    isCurrent: boolean;
    id: string;
    stripe_price_id: string;
    plan: "solo" | "team" | "business" | "enterprise";
    mailbox_limit: number;
  };
  type Plan = "solo" | "team" | "business";
  type BillingInfo = {
    userId: string;
    stripeCustomerId: string | null;
    currentPlan: "solo" | "team" | "business" | "enterprise" | null;
    subscriptionStatus: "trialing" | "active" | "past_due" | "canceled" | null;
    currentPriceId: string | null;
    currentPeriodEnd: string | null;
    mailboxLimit: number;
    mailboxUsed: number;
  };
  type Email = {
    id: number;
    email: string;
    activated: boolean;
  };
  type TranslateFn = (key: string, fallback?: string) => string;
  type PlanKey = PlanInfo["plan"];

  type PlanStatus = "current" | "available" | "locked" | "contact";

  type AvailabilityKey = "match" | "over_limit";

  type StatusVariant = "success" | "warning" | "danger" | "neutral";

  type PlanCardData = {
    id: string;
    plan: PlanKey;
    mailboxLimit: number | null;
    isCurrent: boolean;
    isAvailable: boolean;
    isEnterprise: boolean;
    contactHref?: string;
  };
}
