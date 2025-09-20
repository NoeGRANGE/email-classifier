export type TranslateFn = (key: string, fallback?: string) => string;

export type PlanKey = PlanInfo["plan"];

export type PlanStatus = "current" | "available" | "locked" | "contact";

export type AvailabilityKey = "match" | "over_limit";

export type StatusVariant = "success" | "warning" | "danger" | "neutral";

export type PlanCardData = {
  id: string;
  plan: PlanKey;
  mailboxLimit: number | null;
  isCurrent: boolean;
  isAvailable: boolean;
  isEnterprise: boolean;
  contactHref?: string;
};

export const PLAN_META_FALLBACK: Record<PlanKey, { title: string; description: string }> = {
  solo: {
    title: "Solo",
    description:
      "Perfect for individual founders or early-stage makers who need focused inbox automation.",
  },
  team: {
    title: "Team",
    description:
      "Collaborate with teammates and manage a shared inbox with additional seats included by default.",
  },
  business: {
    title: "Business",
    description:
      "Advanced analytics, higher mailbox limits, and priority support for growing companies.",
  },
  enterprise: {
    title: "Enterprise",
    description:
      "Tailored compliance, deployment flexibility, and dedicated support for larger organisations.",
  },
};

export const PLAN_STATUS_LABEL_FALLBACK: Record<PlanStatus, string> = {
  current: "Current plan",
  available: "Available",
  locked: "Not available",
  contact: "Contact us",
};

export const PLAN_STATUS_NOTE_FALLBACK: Record<PlanStatus, string> = {
  current: "You're currently on this plan.",
  available: "Fits your current usage. Switching will be available soon.",
  locked: "Reduce your usage to drop into this plan.",
  contact: "Let's tailor the right package for your team.",
};

export const PLAN_AVAILABILITY_FALLBACK: Record<AvailabilityKey, string> = {
  match: "Matches your usage",
  over_limit: "Over current limit",
};

export const ENTERPRISE_CONTACT = "mailto:hello@taggly.com";

export const PLAN_ORDER: Record<PlanKey, number> = {
  solo: 1,
  team: 2,
  business: 3,
  enterprise: 4,
};

export function formatTemplate(
  template: string,
  replacements: Record<string, string | number>
): string {
  return Object.entries(replacements).reduce((acc, [key, value]) => {
    const pattern = new RegExp(`\\{${key}\\}`, "g");
    return acc.replace(pattern, String(value));
  }, template);
}

export function buildPlanCards(
  plans: PlanInfo[] | null,
  currentPlan: BillingInfo["currentPlan"]
): PlanCardData[] | null {
  if (!plans) return null;

  const mapped = plans.map<PlanCardData>((plan) => ({
    id: plan.id,
    plan: plan.plan,
    mailboxLimit: plan.mailbox_limit,
    isCurrent: plan.isCurrent,
    isAvailable: plan.canSwitchTo,
    isEnterprise: plan.plan === "enterprise",
    contactHref: plan.plan === "enterprise" ? ENTERPRISE_CONTACT : undefined,
  }));

  const hasEnterprise = mapped.some((plan) => plan.plan === "enterprise");

  if (!hasEnterprise) {
    mapped.push({
      id: "enterprise",
      plan: "enterprise",
      mailboxLimit: null,
      isCurrent: currentPlan === "enterprise",
      isAvailable: false,
      isEnterprise: true,
      contactHref: ENTERPRISE_CONTACT,
    });
  }

  mapped.sort((a, b) => PLAN_ORDER[a.plan] - PLAN_ORDER[b.plan]);
  return mapped;
}
