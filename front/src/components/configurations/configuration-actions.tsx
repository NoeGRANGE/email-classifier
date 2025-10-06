"use client";

import * as React from "react";
import { MoreHorizontal, Settings, Trash2 } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

import styles from "./configuration-actions.module.css";

type ConfigurationActionsProps = {
  configuration: Configuration;
  t: TranslateFn;
  onManage?: (configuration: Configuration) => void;
  onRemove?: (configuration: Configuration) => void;
};

export default function ConfigurationActions({
  configuration,
  t,
  onManage,
  onRemove,
}: ConfigurationActionsProps) {
  const handleManage = React.useCallback(() => {
    onManage?.(configuration);
  }, [configuration, onManage]);

  const handleRemove = React.useCallback(() => {
    onRemove?.(configuration);
  }, [configuration, onRemove]);

  return (
    <div className={styles.root}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("actions.open", "Open configuration actions menu")}
            className={styles.triggerButton}
          >
            <MoreHorizontal aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className={styles.menu}>
          <DropdownMenuItem onSelect={handleManage} className={styles.menuItem}>
            <Settings className="size-4" aria-hidden="true" />
            {t("actions.manage", "Manage")}
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onSelect={handleRemove}
            className={styles.menuItem}
          >
            <Trash2 className="size-4" aria-hidden="true" />
            {t("actions.remove", "Remove")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
