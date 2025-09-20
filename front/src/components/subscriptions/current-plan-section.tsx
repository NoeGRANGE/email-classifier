import * as React from "react";

import styles from "./current-plan-section.module.css";
import type { StatusVariant, TranslateFn } from "./utils";

type CurrentPlanSectionProps = {
  info: BillingInfo;
  t: TranslateFn;
  statusVariant: StatusVariant;
  statusLabel: string;
  currentPlanKey: BillingInfo["currentPlan"];
  currentPlanTitle: string;
  currentPlanDescription: string;
  planDetailLabel: string;
  nextRenewalLabel: string | null;
  mailboxLimitLabel: string;
  usagePercent: number | null;
  usageNote: string | null;
};

export default function CurrentPlanSection({
  info,
  t,
  statusVariant,
  statusLabel,
  currentPlanKey,
  currentPlanTitle,
  currentPlanDescription,
  planDetailLabel,
  nextRenewalLabel,
  mailboxLimitLabel,
  usagePercent,
  usageNote,
}: CurrentPlanSectionProps) {
  const usageStyle = React.useMemo(
    () =>
      usagePercent != null
        ? ({ "--usage-percent": `${usagePercent}%` } as React.CSSProperties)
        : undefined,
    [usagePercent]
  );

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>
          {t("subscriptions.your_plan.title", "Your plan")}
        </h2>
        <p className={styles.sectionSubtitle}>
          {currentPlanKey
            ? t(
                "subscriptions.your_plan.subtitle_with_plan",
                "Overview of your active subscription and usage."
              )
            : t(
                "subscriptions.your_plan.subtitle_without_plan",
                "You are not on a paid plan yet. Choose the option that fits your team."
              )}
        </p>
      </div>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.cardHeaderTop}>
            <p className={styles.currentPlanName}>{currentPlanTitle}</p>
            <p className={styles.currentPlanDescription}>
              {currentPlanDescription}
            </p>
          </div>
          <div className={styles.cardHeaderTopMeta}>
            <span className={styles.statusChip} data-variant={statusVariant}>
              {statusLabel}
            </span>
          </div>
        </div>
        <div className={styles.detailsGrid}>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>
              {t("subscriptions.labels.mailboxes", "Mailboxes")}
            </span>
            <span className={styles.detailValue}>
              {info.mailboxUsed.toLocaleString()} / {mailboxLimitLabel}
            </span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>
              {t("subscriptions.labels.plan", "Plan")}
            </span>
            <span className={styles.detailValue}>{planDetailLabel}</span>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>
              {t("subscriptions.labels.next_renewal", "Next renewal")}
            </span>
            <span className={styles.detailValue}>
              {nextRenewalLabel ?? "—"}
            </span>
          </div>
        </div>
        <div className={styles.usage}>
          <div className={styles.usageHeader}>
            <span>{t("subscriptions.usage.heading", "Usage")}</span>
            <span>
              {usagePercent != null
                ? `${usagePercent}%`
                : t("subscriptions.usage.tracking", "Tracking")}
            </span>
          </div>
          <div
            className={styles.usageBar}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={usagePercent ?? undefined}
            aria-label={t("subscriptions.usage.heading", "Usage")}
          >
            <div className={styles.usageBarFill} style={usageStyle} />
          </div>
          {usageNote ? (
            <span className={styles.planNote}>{usageNote}</span>
          ) : null}
        </div>
      </div>
    </section>
  );
}
