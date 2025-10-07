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

type AssignCategoriesAction = CategoryActionWithType<"assign_categories">;
type Props = CategoryActionDialogComponentProps<"assign_categories">;

type AssignCategoriesProps = {
  categories?: unknown;
};

const FALLBACK_FIELD_PLACEHOLDER = "e.g. Leads, Priority";
const FALLBACK_DESCRIPTION =
  "Choose the categories to attach when the email is classified.";

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

  const initialValue = React.useMemo(() => {
    const rawValue = baseProps.categories;
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

  const [categoriesValue, setCategoriesValue] = React.useState(initialValue);

  React.useEffect(() => {
    setCategoriesValue(initialValue);
  }, [initialValue, action.id]);

  const cancelLabel = t("category.actions.dialog.cancel", "Cancel");
  const saveLabel = t("category.actions.dialog.save", "Save changes");
  const title = t(
    "category.actions.dialog.assign_categories.title",
    t("category.update.actions.assign_categories.label", "Assign categories")
  );
  const description = t(
    "category.actions.dialog.assign_categories.description",
    FALLBACK_DESCRIPTION
  );
  const fieldLabel = t(
    "category.actions.dialog.assign_categories.fieldLabel",
    t("category.update.actions.assign_categories.label", "Assign categories")
  );
  const fieldPlaceholder = t(
    "category.actions.dialog.assign_categories.placeholder",
    FALLBACK_FIELD_PLACEHOLDER
  );
  const helperText = t(
    "category.update.actions.assign_categories.helper",
    "Provide the categories that should be attached to the email, separated by commas."
  );

  const handleSave = React.useCallback(() => {
    const categories = categoriesValue
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const nextAction: AssignCategoriesAction = {
      ...action,
      props: {
        ...baseProps,
        categories,
      },
    };

    onSubmit(nextAction);
  }, [action, baseProps, categoriesValue, onSubmit]);

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
          value={categoriesValue}
          onChange={(event) => setCategoriesValue(event.target.value)}
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
