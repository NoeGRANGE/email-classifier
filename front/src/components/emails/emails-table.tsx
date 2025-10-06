"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "@/components/ui/data-table";
import { cn } from "@/lib/utils";

import EmailActions from "./email-actions";
import styles from "./emails-table.module.css";
import OutlookConnect from "./outlook-connect";
import layoutStyles from "./screen.module.css";

type EmailsTableProps = {
  emails: Email[];
  t: TranslateFn;
  className?: string;
  onActivate?: (email: Email) => void;
  onDeactivate?: (email: Email) => void;
  onRemove?: (email: Email) => void;
  onConfigure?: (email: Email) => void;
  setUpdate: () => void;
  hasMaxMailboxes: boolean;
};

export default function EmailsTable({
  emails,
  t,
  className,
  onActivate,
  onDeactivate,
  onRemove,
  onConfigure,
  setUpdate,
  hasMaxMailboxes,
}: EmailsTableProps) {
  const columns = React.useMemo<ColumnDef<Email>[]>(
    () => [
      {
        accessorKey: "email",
        header: () => t("table.columns.email", "Email"),
        cell: ({ row }) => (
          <span className={styles.emailValue} title={row.original.email}>
            {row.original.email}
          </span>
        ),
      },
      {
        accessorKey: "activated",
        header: () => t("table.columns.status", "Status"),
        cell: ({ row }) => {
          const isActivated = row.original.activated;
          return (
            <span
              className={styles.statusPill}
              data-status={isActivated ? "activated" : "deactivated"}
            >
              {t(
                isActivated ? "status.activated" : "status.deactivated",
                isActivated ? "Activated" : "Deactivated"
              )}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: () => null,
        enableSorting: false,
        cell: ({ row }) => (
          <EmailActions
            email={row.original}
            t={t}
            onActivate={onActivate}
            onDeactivate={onDeactivate}
            onRemove={onRemove}
            onConfigure={onConfigure}
          />
        ),
      },
    ],
    [onActivate, onConfigure, onDeactivate, onRemove, t]
  );

  return (
    <section className={cn(styles.tableSection, className)}>
      <div className={styles.tableHeader}>
        <h2 className={styles.tableTitle}>
          {t("table.title", "Connected email addresses")}
        </h2>
        <p className={styles.tableDescription}>
          {t(
            "table.description",
            "Check which addresses are active and manage each connection."
          )}
        </p>
      </div>
      <OutlookConnect
        className={layoutStyles.headerActions}
        setUpdate={setUpdate}
        disabled={hasMaxMailboxes}
      />
      <DataTable
        data={emails}
        columns={columns}
        className={styles.table}
        initialSorting={[{ id: "email", desc: false }]}
      />
    </section>
  );
}
