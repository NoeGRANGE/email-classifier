"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslations } from "@/i18n/use-translations";

import {
  CategoryActionDialogComponentProps,
  CategoryActionWithType,
  getActionProps,
} from "./types";
import styles from "./dialog.module.css";

type ForwardToAction = CategoryActionWithType<"forward_to">;
type Props = CategoryActionDialogComponentProps<"forward_to">;

type ForwardToProps = {
  recipients?: unknown;
};

const FALLBACK_DESCRIPTION = "Forward the email to one or more recipients.";
const FALLBACK_PLACEHOLDER = "e.g. team@company.com, support@company.com";

export default function ForwardToActionDialog({
  action,
  onSubmit,
  onCancel,
}: Props) {
  const { t } = useTranslations("configurations");
  const inputId = React.useId();
  const baseProps = React.useMemo<ForwardToProps>(
    () => getActionProps(action) as ForwardToProps,
    [action]
  );

  const initialValue = React.useMemo(() => {
    const rawValue = baseProps.recipients;
    if (Array.isArray(rawValue)) {
      return rawValue
        .filter((item): item is string => typeof item === "string")
        .join(", ");
    }
    if (typeof rawValue === "string") {
      return rawValue;
    }
    return "";
  }, [baseProps]);

  const [recipientsValue, setRecipientsValue] = React.useState(initialValue);

  React.useEffect(() => {
    setRecipientsValue(initialValue);
  }, [initialValue, action.id]);

  const cancelLabel = t("category.actions.dialog.cancel", "Cancel");
  const saveLabel = t("category.actions.dialog.save", "Save changes");
  const title = t(
    "category.actions.dialog.forward_to.title",
    t("category.update.actions.forward_to.label", "Forward to")
  );
  const description = t(
    "category.actions.dialog.forward_to.description",
    FALLBACK_DESCRIPTION
  );
  const fieldLabel = t(
    "category.actions.dialog.forward_to.fieldLabel",
    t("category.update.actions.forward_to.label", "Forward to")
  );
  const fieldPlaceholder = t(
    "category.actions.dialog.forward_to.placeholder",
    FALLBACK_PLACEHOLDER
  );
  const helperText = t(
    "category.actions.dialog.forward_to.helper",
    "Separate addresses with commas."
  );

  const handleSave = React.useCallback(() => {
    const recipients = recipientsValue
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const nextAction: ForwardToAction = {
      ...action,
      props: {
        ...baseProps,
        recipients,
      },
    };

    onSubmit(nextAction);
  }, [action, baseProps, onSubmit, recipientsValue]);

  return (
    <>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <div className="flex flex-col gap-2">
        <Label htmlFor={inputId}>{fieldLabel}</Label>
        <Input
          id={inputId}
          value={recipientsValue}
          onChange={(event) => setRecipientsValue(event.target.value)}
          placeholder={fieldPlaceholder}
          className={styles.input}
        />
        <p className="text-muted-foreground text-xs">{helperText}</p>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel} type="button">
          {cancelLabel}
        </Button>
        <Button variant="primary" onClick={handleSave} type="button">
          {saveLabel}
        </Button>
      </DialogFooter>
    </>
  );
}
