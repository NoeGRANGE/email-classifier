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

type MoveToFolderAction = CategoryActionWithType<"move_to_folder">;
type Props = CategoryActionDialogComponentProps<"move_to_folder">;

type MoveToFolderProps = {
  folder?: unknown;
};

const FALLBACK_DESCRIPTION =
  "Decide where to move the email after classification.";
const FALLBACK_PLACEHOLDER = "e.g. CRM/Leads";

export default function MoveToFolderActionDialog({
  action,
  onSubmit,
  onCancel,
}: Props) {
  const { t } = useTranslations("configurations");
  const inputId = React.useId();
  const baseProps = React.useMemo<MoveToFolderProps>(
    () => getActionProps(action) as MoveToFolderProps,
    [action]
  );

  const initialValue = React.useMemo(() => {
    const rawValue = baseProps.folder;
    return typeof rawValue === "string" ? rawValue : "";
  }, [baseProps]);

  const [folderValue, setFolderValue] = React.useState(initialValue);

  React.useEffect(() => {
    setFolderValue(initialValue);
  }, [initialValue, action.id]);

  const cancelLabel = t("category.actions.dialog.cancel", "Cancel");
  const saveLabel = t("category.actions.dialog.save", "Save changes");
  const title = t(
    "category.actions.dialog.move_to_folder.title",
    t("category.update.actions.move_to_folder.label", "Move to folder")
  );
  const description = t(
    "category.actions.dialog.move_to_folder.description",
    FALLBACK_DESCRIPTION
  );
  const fieldLabel = t(
    "category.actions.dialog.move_to_folder.fieldLabel",
    t("category.update.actions.move_to_folder.label", "Move to folder")
  );
  const fieldPlaceholder = t(
    "category.actions.dialog.move_to_folder.placeholder",
    FALLBACK_PLACEHOLDER
  );
  const helperText = t(
    "category.update.actions.move_to_folder.helper",
    "Specify the destination folder or label."
  );

  const handleSave = React.useCallback(() => {
    const nextAction: MoveToFolderAction = {
      ...action,
      props: {
        ...baseProps,
        folder: folderValue.trim(),
      },
    };

    onSubmit(nextAction);
  }, [action, baseProps, folderValue, onSubmit]);

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
          value={folderValue}
          onChange={(event) => setFolderValue(event.target.value)}
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
