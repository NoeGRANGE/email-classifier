"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import * as API from "@/lib/api";

type MoveToFolderAction = CategoryActionWithType<"move_to_folder">;
type Props = CategoryActionDialogComponentProps<"move_to_folder">;

type MoveToFolderProps = {
  folder?: unknown;
};

const FALLBACK_DESCRIPTION =
  "Decide where to move the email after classification.";
const FALLBACK_PLACEHOLDER = "Select a folder";

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

  const path = window.location.pathname.split("/");
  const configurationId = Number(path[path.length - 1]);

  const {
    data: folders,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["email folders"],
    queryFn: async () => {
      const response = await API.getEmailFolders(configurationId);
      return response.folders;
    },
    placeholderData: keepPreviousData,
  });

  const sortedFolders = React.useMemo(() => {
    if (!folders?.length) return [];
    return [...folders].sort((a, b) =>
      a.displayName.localeCompare(b.displayName, undefined, {
        sensitivity: "base",
      })
    );
  }, [folders]);

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
    "Specify the destination folder."
  );

  const handleSave = React.useCallback(() => {
    if (!folderValue) return;

    const nextAction: MoveToFolderAction = {
      ...action,
      props: {
        ...baseProps,
        folder: folderValue,
      },
    };

    onSubmit(nextAction);
  }, [action, baseProps, folderValue, onSubmit]);

  const isSelectDisabled = isLoading && !sortedFolders.length;

  return (
    <>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <div className="flex flex-col gap-2">
        <Label htmlFor={inputId}>{fieldLabel}</Label>
        <Select
          value={folderValue}
          onValueChange={setFolderValue}
          disabled={isSelectDisabled || isFetching}
        >
          <SelectTrigger id={inputId} className={styles.select}>
            <SelectValue placeholder={fieldPlaceholder} />
          </SelectTrigger>
          <SelectContent>
            {sortedFolders.map((folder) => (
              <SelectItem
                key={folder.id}
                value={folder.id}
                className={styles.selectItem}
              >
                {folder.displayName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-muted-foreground text-xs">{helperText}</p>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel} type="button">
          {cancelLabel}
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          type="button"
          disabled={!folderValue || isFetching}
        >
          {saveLabel}
        </Button>
      </DialogFooter>
    </>
  );
}
