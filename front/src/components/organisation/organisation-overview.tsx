import * as React from "react";
import { Building2, Mailbox, ShieldCheck, Users2 } from "lucide-react";

import styles from "./organisation-overview.module.css";
import { formatTemplate, type NormalisedMember } from "./utils";

type OrganisationOverviewProps = {
  seatsPurchased: number;
  seatsUsed: number;
  members: NormalisedMember[];
  t: TranslateFn;
};

export default function OrganisationOverview({
  seatsPurchased,
  seatsUsed,
  members,
  t,
}: OrganisationOverviewProps) {
  const totalMembers = members.length;
  const pendingMembers = members.filter(
    (member) => member._statusKey !== "accepted"
  ).length;
  const activeMembers = totalMembers - pendingMembers;

  const usagePercent = seatsPurchased
    ? Math.round(Math.min(1, Math.max(0, seatsUsed / seatsPurchased)) * 100)
    : null;

  const usageStyle =
    usagePercent != null
      ? ({ "--usage-percent": `${usagePercent}%` } as React.CSSProperties)
      : undefined;

  const membersSummary = formatTemplate(
    t("summary.members", "{count} members"),
    { count: totalMembers.toLocaleString() }
  );

  const seatsSummary = formatTemplate(
    t("summary.seats", "{used} of {total} mailboxes"),
    {
      used: seatsUsed.toLocaleString(),
      total: seatsPurchased.toLocaleString(),
    }
  );

  const usagePercentLabel =
    usagePercent != null
      ? formatTemplate(t("summary.usage.percent", "{percent}% used"), {
          percent: usagePercent,
        })
      : t("summary.usage.unlimited", "Tracking usage");

  const usageNoteCopy = seatsPurchased
    ? formatTemplate(
        t(
          "summary.usage.note",
          "{used} mailboxes used out of {total} available."
        ),
        {
          used: seatsUsed.toLocaleString(),
          total: seatsPurchased.toLocaleString(),
        }
      )
    : t(
        "summary.usage.noLimit",
        "No mailbox limit is set. Usage is tracked for insights."
      );

  return (
    <section className={styles.summaryCard}>
      <div className={styles.summaryHeader}>
        <p className={styles.summaryTitle}>
          {t("summary.title", "Organisation overview")}
        </p>
        <div className={styles.summaryMeta}>
          <span>
            <Building2
              className="inline-block size-4 align-middle"
              aria-hidden="true"
            />
            <span className="ml-2 align-middle">{membersSummary}</span>
          </span>
          <span>
            <Mailbox
              className="inline-block size-4 align-middle"
              aria-hidden="true"
            />
            <span className="ml-2 align-middle">{seatsSummary}</span>
          </span>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <Users2 className={styles.statIcon} aria-hidden="true" />
            <span className={styles.statLabel}>
              {t("summary.metrics.active", "Active members")}
            </span>
          </div>
          <span className={styles.statValue}>
            {activeMembers.toLocaleString()}
          </span>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <ShieldCheck className={styles.statIcon} aria-hidden="true" />
            <span className={styles.statLabel}>
              {t("summary.metrics.pending", "Pending invites")}
            </span>
          </div>
          <span className={styles.statValue}>
            {pendingMembers.toLocaleString()}
          </span>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <Mailbox className={styles.statIcon} aria-hidden="true" />
            <span className={styles.statLabel}>
              {t("summary.metrics.capacity", "Seats purchased")}
            </span>
          </div>
          <span className={styles.statValue}>
            {seatsPurchased.toLocaleString()}
          </span>
        </div>
      </div>

      <div className={styles.usage}>
        <div className={styles.usageHeader}>
          <span className={styles.usageTitle}>
            {t("summary.usage.heading", "Mailboxes usage")}
          </span>
          <span className={styles.usagePercent}>{usagePercentLabel}</span>
        </div>
        <div
          className={styles.usageBar}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={usagePercent ?? undefined}
        >
          <div className={styles.usageBarFill} style={usageStyle} />
        </div>
        <span className={styles.usageNote}>{usageNoteCopy}</span>
      </div>
    </section>
  );
}
