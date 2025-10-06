"use client";

import * as React from "react";

import { Skeleton } from "@/components/ui/skeleton";

import ConfigurationActions from "./configuration-actions";
import styles from "./configurations-table.module.css";

type ConfigurationsTableProps = {
  configurations: Configuration[];
  t: TranslateFn;
  isLoading?: boolean;
  onManage?: (configuration: Configuration) => void;
  onRemove?: (configuration: Configuration) => void;
};

export default function ConfigurationsTable({
  configurations,
  t,
  isLoading = false,
  onManage,
  onRemove,
}: ConfigurationsTableProps) {
  const hasConfigurations = configurations.length > 0;

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>
          {t("table.title", "Configurations")}
        </h2>
        <p className={styles.sectionDescription}>
          {t(
            "table.description",
            "Browse existing configurations and manage them when needed."
          )}
        </p>
      </div>

      <div
        className={styles.tableWrapper}
        role="region"
        aria-live="polite"
        aria-busy={isLoading}
      >
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">
                {t("table.columns.name", "Name")}
              </th>
              <th scope="col">
                {t("table.columns.actions", "Actions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <tr key={`loading-${index}`}>
                    <td>
                      <Skeleton
                        className={styles.loadingSkeleton}
                        aria-hidden="true"
                      />
                    </td>
                    <td className={styles.actionsCell}>
                      <Skeleton
                        className={styles.loadingSkeleton}
                        aria-hidden="true"
                      />
                    </td>
                  </tr>
                ))
              : hasConfigurations
              ? configurations.map((configuration) => (
                  <tr key={configuration.id}>
                    <td>
                      <span
                        className={styles.nameCell}
                        title={configuration.name}
                      >
                        {configuration.name}
                      </span>
                    </td>
                    <td className={styles.actionsCell}>
                      <ConfigurationActions
                        configuration={configuration}
                        t={t}
                        onManage={onManage}
                        onRemove={onRemove}
                      />
                    </td>
                  </tr>
                ))
              : (
                  <tr>
                    <td colSpan={2} className={styles.emptyCell}>
                      {t("table.empty", "No configurations yet.")}
                    </td>
                  </tr>
                )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
