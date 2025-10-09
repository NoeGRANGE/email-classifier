"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

import EmailActions from "./email-actions";
import tableStyles from "./emails-table.module.css";
import styles from "./emails-card-list.module.css";

type EmailsCardListProps = {
  emails: Email[];
  t: TranslateFn;
  onActivate?: (email: Email) => void;
  onDeactivate?: (email: Email) => void;
  onRemove?: (email: Email) => void;
  onConfigure?: (email: Email) => void;
};

export default function EmailsCardList({
  emails,
  t,
  onActivate,
  onDeactivate,
  onRemove,
  onConfigure,
}: EmailsCardListProps) {
  if (!emails.length) {
    return (
      <div className={styles.emptyState}>
        {t("table.empty", "No results.")}
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {emails.map((email) => {
        const isActivated = email.activated;
        const statusKey = isActivated ? "activated" : "deactivated";
        const statusLabel = isActivated
          ? t("status.activated", "Activated")
          : t("status.deactivated", "Deactivated");

        return (
          <article key={email.id} className={styles.card}>
            <div className={styles.cardContent}>
              <div className={styles.info}>
                <span className={styles.email} title={email.email}>
                  {email.email}
                </span>
                <span
                  className={cn(tableStyles.statusPill, styles.statusPill)}
                  data-status={statusKey}
                >
                  {statusLabel}
                </span>
              </div>
              <EmailActions
                email={email}
                t={t}
                onActivate={onActivate}
                onDeactivate={onDeactivate}
                onRemove={onRemove}
                onConfigure={onConfigure}
                className={styles.actions}
              />
            </div>
          </article>
        );
      })}
    </div>
  );
}
