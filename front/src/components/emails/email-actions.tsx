"use client";

import * as React from "react";
import { MoreHorizontal, Power, PowerOff, Settings, Trash2 } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import styles from "./email-actions.module.css";

type EmailActionsProps = {
  email: Email;
  t: TranslateFn;
  className?: string;
  onActivate?: (email: Email) => void;
  onDeactivate?: (email: Email) => void;
  onRemove?: (email: Email) => void;
  onConfigure?: (email: Email) => void;
};

export default function EmailActions({
  email,
  t,
  className,
  onActivate,
  onDeactivate,
  onRemove,
  onConfigure,
}: EmailActionsProps) {
  const handleConfigure = React.useCallback(() => {
    onConfigure?.(email);
  }, [email, onConfigure]);

  const handleActivate = React.useCallback(() => {
    onActivate?.(email);
  }, [email, onActivate]);

  const handleDeactivate = React.useCallback(() => {
    onDeactivate?.(email);
  }, [email, onDeactivate]);

  const handleRemove = React.useCallback(() => {
    onRemove?.(email);
  }, [email, onRemove]);

  return (
    <div className={cn(styles.root, className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("actions.open", "Open email actions menu")}
            className={styles.triggerButton}
          >
            <MoreHorizontal aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className={styles.menu}>
          <DropdownMenuItem
            onSelect={handleConfigure}
            className={styles.menuItem}
          >
            <Settings className="size-4" aria-hidden="true" />
            {t("actions.configure", "Configure")}
          </DropdownMenuItem>
          {email.activated ? (
            <DropdownMenuItem
              onSelect={handleDeactivate}
              className={styles.menuItem}
            >
              <PowerOff className="size-4" aria-hidden="true" />
              {t("actions.deactivate", "Deactivate")}
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onSelect={handleActivate}
              className={styles.menuItem}
            >
              <Power className="size-4" aria-hidden="true" />
              {t("actions.activate", "Activate")}
            </DropdownMenuItem>
          )}
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
