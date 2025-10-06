"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import styles from "./create-dialog.module.css";

type ConfigurationCreateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string) => Promise<void> | void;
  isSubmitting?: boolean;
  t: TranslateFn;
};

export default function ConfigurationCreateDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
  t,
}: ConfigurationCreateDialogProps) {
  const [name, setName] = React.useState("");

  const resetForm = React.useCallback(() => {
    setName("");
  }, []);

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      onOpenChange(nextOpen);
      if (!nextOpen) {
        resetForm();
      }
    },
    [onOpenChange, resetForm]
  );

  React.useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open, resetForm]);

  const isFormValid = name.trim().length > 0;

  const handleSubmit = React.useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const trimmedName = name.trim();
      if (!trimmedName) return;
      await onSubmit(trimmedName);
    },
    [name, onSubmit]
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={styles.dialogContent}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {t("createDialog.title", "Create a new configuration")}
            </DialogTitle>
            <DialogDescription>
              {t(
                "createDialog.description",
                "Name your configuration. You can adjust details later."
              )}
            </DialogDescription>
          </DialogHeader>

          <div className={styles.fieldGroup}>
            <div className={styles.field}>
              <label
                htmlFor="configuration-name"
                className="text-sm font-medium"
              >
                {t("createDialog.nameLabel", "Configuration name")}
              </label>
              <Input
                id="configuration-name"
                className={styles.nameInput}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder={t(
                  "createDialog.namePlaceholder",
                  "E.g. Inbound triage"
                )}
                autoFocus
                required
              />
            </div>
            <p className={styles.helperText}>
              {t(
                "createDialog.helperText",
                "You'll be able to link emails and categories after creation."
              )}
            </p>
          </div>

          <DialogFooter>
            <DialogClose asChild disabled={isSubmitting}>
              <Button variant="outline" type="button">
                {t("createDialog.cancel", "Cancel")}
              </Button>
            </DialogClose>
            <Button
              type="submit"
              variant="primary"
              disabled={!isFormValid || isSubmitting}
              aria-disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting
                ? t("createDialog.submitting", "Creating…")
                : t("createDialog.confirm", "Create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
