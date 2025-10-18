import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import styles from "./plan-card.module.css";
import {
  ENTERPRISE_CONTACT,
  PLAN_AVAILABILITY_FALLBACK,
  PLAN_META_FALLBACK,
  PLAN_STATUS_LABEL_FALLBACK,
  PLAN_STATUS_NOTE_FALLBACK,
  formatTemplate,
} from "./utils";

type PlanCardProps = {
  plan: PlanCardData;
  t: TranslateFn;
  onSelectPlan?: (plan: PlanCardData) => void;
  isPending?: boolean;
  hasActiveSubscription?: boolean;
  onManageBilling?: () => void;
  manageBillingPending?: boolean;
};

export default function PlanCard({
  plan,
  t,
  onSelectPlan,
  isPending = false,
  hasActiveSubscription = false,
  onManageBilling,
  manageBillingPending = false,
}: PlanCardProps) {
  const planTitle = t(
    `subscriptions.plan.meta.${plan.plan}.title`,
    PLAN_META_FALLBACK[plan.plan].title
  );
  const planDescription = t(
    `subscriptions.plan.meta.${plan.plan}.description`,
    PLAN_META_FALLBACK[plan.plan].description
  );

  const planStatus: PlanStatus = plan.isEnterprise
    ? plan.isCurrent
      ? "current"
      : "contact"
    : plan.isCurrent
    ? "current"
    : plan.isAvailable
    ? "available"
    : "locked";

  const cardClassName = cn(
    styles.planCard,
    plan.isCurrent && styles.planCardCurrent,
    plan.isEnterprise && styles.planCardEnterprise
  );

  const availabilityKey =
    plan.isAvailable || plan.isCurrent ? "match" : "over_limit";

  const availabilityText = t(
    `subscriptions.plan.availability.${availabilityKey}`,
    PLAN_AVAILABILITY_FALLBACK[availabilityKey]
  );

  const limitLabel = plan.isEnterprise
    ? t("subscriptions.plan.mailboxes.custom", "Custom")
    : plan.mailboxLimit
    ? formatTemplate(
        t("subscriptions.plan.mailboxes.limited", "{count} mailboxes"),
        { count: plan.mailboxLimit.toLocaleString() }
      )
    : t("subscriptions.plan.mailboxes.unlimited", "Unlimited");

  const planStatusLabel = t(
    `subscriptions.plan.status.${planStatus}.label`,
    PLAN_STATUS_LABEL_FALLBACK[planStatus]
  );

  const planStatusNote = t(
    `subscriptions.plan.status.${planStatus}.note`,
    PLAN_STATUS_NOTE_FALLBACK[planStatus]
  );

  const shouldShowManageBilling =
    planStatus === "available" &&
    hasActiveSubscription &&
    !plan.isEnterprise &&
    typeof onManageBilling === "function";

  return (
    <div className={cardClassName}>
      <div className={styles.planContent}>
        <div className={styles.planHeader}>
          <p className={styles.planTitle}>{planTitle}</p>
          <span className={styles.planStatusChip} data-status={planStatus}>
            {planStatusLabel}
          </span>
        </div>
        <p className={styles.planDescription}>{planDescription}</p>
      </div>
      <div className={styles.planContent}>
        <div className={styles.planDetails}>
          <div className={styles.planDetailRow}>
            <span>{t("subscriptions.labels.mailboxes", "Mailboxes")}</span>
            <span className={styles.planDetailValue}>{limitLabel}</span>
          </div>
          {/* {!plan.isEnterprise && (
          <div className={styles.planDetailRow}>
            <span>
              {t("subscriptions.plan.labels.availability", "Availability")}
            </span>
            <span className={styles.planDetailValue}>{availabilityText}</span>
          </div>
        )} */}
        </div>
        <div className={styles.planFooter}>
          {planStatus === "contact" ? (
            <Button asChild>
              <a href={plan.contactHref ?? ENTERPRISE_CONTACT}>
                {t("subscriptions.plan.actions.contact", "Contact sales")}
              </a>
            </Button>
          ) : planStatus === "available" ? (
            shouldShowManageBilling ? (
              <Button
                variant="primary"
                disabled={manageBillingPending}
                onClick={onManageBilling}
                aria-busy={manageBillingPending || undefined}
              >
                {manageBillingPending
                  ? t(
                      "subscriptions.plan.actions.manage_billing_pending",
                      "Opening portal…"
                    )
                  : t(
                      "subscriptions.plan.actions.manage_billing",
                      "Manage billing"
                    )}
              </Button>
            ) : (
              <Button
                disabled={!plan.isAvailable || isPending}
                variant="primary"
                onClick={() => onSelectPlan?.(plan)}
                aria-busy={isPending || undefined}
              >
                {isPending
                  ? t(
                      "subscriptions.plan.actions.select_pending",
                      "Opening checkout…"
                    )
                  : t("subscriptions.plan.actions.select", "Try For Free")}
              </Button>
            )
          ) : planStatus === "current" ? (
            <Button variant="outline" disabled>
              {t("subscriptions.plan.actions.current", "Current plan")}
            </Button>
          ) : (
            <Button variant="outline" disabled>
              {t("subscriptions.plan.actions.unavailable", "Unavailable")}
            </Button>
          )}
          {/* <span className={styles.planNote}>{planStatusNote}</span> */}
        </div>
      </div>
    </div>
  );
}
