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

type AssignCategoriesAction = CategoryActionWithType<"assign_categories">;
type Props = CategoryActionDialogComponentProps<"assign_categories">;

type AssignCategoriesProps = {
  categories?: unknown;
};

const FALLBACK_FIELD_PLACEHOLDER = "Select a category";
const FALLBACK_DESCRIPTION =
  "Choose the category to attach when the email is classified.";

export default function AssignCategoriesActionDialog({
  action,
  onSubmit,
  onCancel,
}: Props) {
  const { t } = useTranslations("configurations");
  const inputId = React.useId();
  const baseProps = React.useMemo<AssignCategoriesProps>(
    () => getActionProps(action) as AssignCategoriesProps,
    [action]
  );

  const path = window.location.pathname.split("/");
  const configurationId = Number(path[path.length - 1]);

  const {
    data: tags,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["email tags"],
    queryFn: async () => {
      const response = await API.getEmailTags(configurationId);
      return response.tags;
    },
    placeholderData: keepPreviousData,
  });

  const initialValue = React.useMemo(() => {
    const rawValue = baseProps.categories;
    if (typeof rawValue === "string") {
      return rawValue;
    }
    if (Array.isArray(rawValue)) {
      return (
        rawValue.find((item): item is string => typeof item === "string") || ""
      );
    }
    return "";
  }, [baseProps]);

  const [selectedCategoryId, setSelectedCategoryId] =
    React.useState(initialValue);

  React.useEffect(() => {
    setSelectedCategoryId(initialValue);
  }, [initialValue, action.id]);

  const cancelLabel = t("category.actions.dialog.cancel", "Cancel");
  const saveLabel = t("category.actions.dialog.save", "Save changes");
  const title = t(
    "category.actions.dialog.assign_categories.title",
    t("category.update.actions.assign_categories.label", "Assign category")
  );
  const description = t(
    "category.actions.dialog.assign_categories.description",
    FALLBACK_DESCRIPTION
  );
  const fieldLabel = t(
    "category.actions.dialog.assign_categories.fieldLabel",
    t("category.update.actions.assign_categories.label", "Assign category")
  );
  const fieldPlaceholder = t(
    "category.actions.dialog.assign_categories.placeholder",
    FALLBACK_FIELD_PLACEHOLDER
  );
  const helperText = t(
    "category.update.actions.assign_categories.helper",
    "Select the category that should be attached to the email."
  );

  const handleSave = React.useCallback(() => {
    if (!selectedCategoryId) return;

    const nextAction: AssignCategoriesAction = {
      ...action,
      props: {
        ...baseProps,
        categories: selectedCategoryId,
      },
    };

    onSubmit(nextAction);
  }, [action, baseProps, onSubmit, selectedCategoryId]);

  const isSelectDisabled = isLoading && !tags;

  return (
    <>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <div className="flex flex-col gap-2">
        <Label htmlFor={inputId}>{fieldLabel}</Label>
        <Select
          value={selectedCategoryId}
          onValueChange={setSelectedCategoryId}
          disabled={isSelectDisabled || isFetching}
        >
          <SelectTrigger id={inputId} className={styles.select}>
            <SelectValue placeholder={fieldPlaceholder} />
          </SelectTrigger>
          <SelectContent>
            {(tags ?? []).map((tag) => (
              <SelectItem
                key={tag.id}
                value={tag.id}
                className={styles.selectItem}
              >
                {tag.displayName}
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
          disabled={!selectedCategoryId || isFetching}
        >
          {saveLabel}
        </Button>
      </DialogFooter>
    </>
  );
}
