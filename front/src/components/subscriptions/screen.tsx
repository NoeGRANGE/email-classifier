"use client";

import * as React from "react";

import { useTranslations } from "@/i18n/use-translations";
import { getBillingInfo, getBillingPlans } from "@/lib/api";

import AvailablePlansSection from "./available-plans-section";
import CurrentPlanSection from "./current-plan-section";
import styles from "./screen.module.css";
import {
  PLAN_META_FALLBACK,
  buildPlanCards,
  formatTemplate,
  type PlanCardData,
  type StatusVariant,
} from "./utils";

type SubscriptionStatus = NonNullable<BillingInfo["subscriptionStatus"]>;

const SUBSCRIPTION_STATUS_FALLBACK: Record<SubscriptionStatus, string> = {
  active: "Active",
  trialing: "Trialing",
  past_due: "Past due",
  canceled: "Canceled",
};

const LOAD_ERROR_TOKEN = "__load_error__";

const STATUS_VARIANTS: Record<SubscriptionStatus, StatusVariant> = {
  active: "success",
  trialing: "warning",
  past_due: "danger",
  canceled: "neutral",
};

export default function SubscriptionsScreen() {
  const { t } = useTranslations("subscriptions");
  const [info, setInfo] = React.useState<BillingInfo | null>(null);
  const [plans, setPlans] = React.useState<PlanInfo[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    Promise.all([getBillingInfo(), getBillingPlans()])
      .then(([billingInfo, billingPlans]) => {
        if (!mounted) return;
        setInfo(billingInfo);
        setPlans(billingPlans);
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e?.message || LOAD_ERROR_TOKEN);
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);
  console.log({ plans });
  console.log("info");
  console.log(info);

  const planCards = React.useMemo<PlanCardData[] | null>(
    () => buildPlanCards(plans, info?.currentPlan ?? null),
    [plans, info?.currentPlan]
  );

  const subscriptionStatus = info?.subscriptionStatus ?? null;
  const statusVariant: StatusVariant = subscriptionStatus
    ? STATUS_VARIANTS[subscriptionStatus]
    : "neutral";
  const statusLabel = subscriptionStatus
    ? t(
        `subscriptions.status.${subscriptionStatus}`,
        SUBSCRIPTION_STATUS_FALLBACK[subscriptionStatus]
      )
    : t("subscriptions.status.none", "No active subscription");

  const errorMessage = error
    ? error === LOAD_ERROR_TOKEN
      ? t("subscriptions.state.error_loading", "Failed to load billing data.")
      : error
    : null;

  const currentPlanKey = info?.currentPlan ?? null;
  const currentPlanTitle = currentPlanKey
    ? t(
        `subscriptions.plan.meta.${currentPlanKey}.title`,
        PLAN_META_FALLBACK[currentPlanKey].title
      )
    : t("subscriptions.plan.none", "No active plan");
  const currentPlanDescription = currentPlanKey
    ? t(
        `subscriptions.plan.meta.${currentPlanKey}.description`,
        PLAN_META_FALLBACK[currentPlanKey].description
      )
    : t(
        "subscriptions.plan.empty_description",
        "Select a plan to unlock advanced collaboration and higher mailbox limits."
      );
  const planDetailLabel = currentPlanKey
    ? t(
        `subscriptions.plan.meta.${currentPlanKey}.title`,
        PLAN_META_FALLBACK[currentPlanKey].title
      )
    : t("subscriptions.plan.free", "Free");

  const nextRenewalLabel = React.useMemo(() => {
    if (!info?.currentPeriodEnd) return null;
    const date = new Date(info.currentPeriodEnd);
    if (Number.isNaN(date.getTime())) return null;
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
      date
    );
  }, [info?.currentPeriodEnd]);

  const mailboxLimit = info?.mailboxLimit ?? 0;
  const usagePercent =
    mailboxLimit > 0
      ? Math.min(
          100,
          Math.round(((info?.mailboxUsed ?? 0) / mailboxLimit) * 100)
        )
      : null;

  const mailboxLimitLabel = mailboxLimit.toLocaleString();

  const usageNote = info
    ? info.mailboxLimit > 0
      ? formatTemplate(
          t(
            "subscriptions.usage.note_limited",
            "{used} of {limit} mailboxes in use."
          ),
          {
            used: info.mailboxUsed.toLocaleString(),
            limit: info.mailboxLimit.toLocaleString(),
          }
        )
      : t(
          "subscriptions.usage.note_unlimited",
          "Usage is tracked for insights even without a hard limit."
        )
    : null;

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          {t("subscriptions.title", "Subscriptions")}
        </h1>
        <p className={styles.lead}>
          {t(
            "subscriptions.lead",
            "Manage your workspace plan, track mailbox usage, and explore the best option for your team."
          )}
        </p>
      </header>

      {loading ? (
        <div className={styles.stateCard}>
          {t("subscriptions.state.loading", "Loading billing details…")}
        </div>
      ) : errorMessage ? (
        <div className={`${styles.stateCard} ${styles.errorCard}`}>
          {errorMessage}
        </div>
      ) : (
        <>
          {info ? (
            <CurrentPlanSection
              info={info}
              t={t}
              statusVariant={statusVariant}
              statusLabel={statusLabel}
              currentPlanKey={currentPlanKey}
              currentPlanTitle={currentPlanTitle}
              currentPlanDescription={currentPlanDescription}
              planDetailLabel={planDetailLabel}
              nextRenewalLabel={nextRenewalLabel}
              mailboxLimitLabel={mailboxLimitLabel}
              usagePercent={usagePercent}
              usageNote={usageNote}
            />
          ) : null}

          {planCards && planCards.length > 0 ? (
            <AvailablePlansSection planCards={planCards} t={t} />
          ) : null}
        </>
      )}
    </div>
  );
}
