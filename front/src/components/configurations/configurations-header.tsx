"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";

import layoutStyles from "./screen.module.css";

type ConfigurationsHeaderProps = {
  t: TranslateFn;
  onCreate: () => void;
  isLoading?: boolean;
};

export default function ConfigurationsHeader({
  t,
  onCreate,
  isLoading = false,
}: ConfigurationsHeaderProps) {
  const handleClick = React.useCallback(() => {
    onCreate();
  }, [onCreate]);

  return (
    <header className={layoutStyles.header}>
      <div className={layoutStyles.headerRow}>
        <div className={layoutStyles.headerContent}>
          <h1 className={layoutStyles.title}>
            {t("title", "Configurations")}
          </h1>
          <p className={layoutStyles.lead}>
            {t(
              "lead",
              "Review the configurations available for your workspace."
            )}
          </p>
        </div>
        <div className={layoutStyles.headerActions}>
          <Button
            variant="primary"
            size="default"
            onClick={handleClick}
            disabled={isLoading}
            aria-label={t(
              "create.aria",
              "Create a new configuration"
            )}
          >
            {t("create", "New configuration")}
          </Button>
        </div>
      </div>
    </header>
  );
}
