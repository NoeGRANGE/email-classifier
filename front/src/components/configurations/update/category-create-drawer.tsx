"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  RightDrawer,
  RightDrawerClose,
  RightDrawerContent,
  RightDrawerDescription,
  RightDrawerFooter,
  RightDrawerHeader,
  RightDrawerTitle,
} from "@/components/ui/right-drawer";
import { cn } from "@/lib/utils";
import CategoryUpdateInfos from "./infos";
import styles from "./category-create-drawer.module.css";
import CategoryUpdateActions from "./actions";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  category?: CategoryDetail;
  closeLabel: string;
  primaryLabel: string;
  onSubmit?: (payload: {
    id?: number;
    name: string;
    description: string;
    isNew: boolean;
  }) => void;
  className?: string;
};

export default function CategoryCreateDrawer({
  open,
  onOpenChange,
  title,
  description,
  category,
  closeLabel,
  primaryLabel,
  onSubmit,
  className,
}: Props) {
  const [categoryName, setCategoryName] = React.useState(category?.name ?? "");
  const [categoryDescription, setCategoryDescription] = React.useState(
    category?.description ?? ""
  );
  const [categoryActions, setCategoryActions] = React.useState<
    CategoryAction[]
  >(category?.actions || []);

  React.useEffect(() => {
    setCategoryName(category?.name ?? "");
    setCategoryDescription(category?.description ?? "");
    setCategoryActions(category?.actions || []);
  }, [category, open]);

  const isNew = !category;
  const isFormValid =
    categoryName.trim().length > 0 && categoryDescription.trim().length > 0;

  const handleSubmit = React.useCallback(() => {
    if (!isFormValid) return;
    onSubmit?.({
      id: category?.id,
      name: categoryName.trim(),
      description: categoryDescription.trim(),
      isNew,
    });
  }, [
    category?.id,
    categoryDescription,
    categoryName,
    isFormValid,
    isNew,
    onSubmit,
  ]);

  return (
    <RightDrawer open={open} onOpenChange={onOpenChange}>
      <RightDrawerContent className={cn("flex h-full flex-col", className)}>
        <RightDrawerHeader className="px-0">
          <RightDrawerTitle>{title}</RightDrawerTitle>
          <RightDrawerDescription>{description}</RightDrawerDescription>
        </RightDrawerHeader>
        <div className={styles.container}>
          <CategoryUpdateInfos
            name={categoryName}
            description={categoryDescription}
            setName={setCategoryName}
            setDescription={setCategoryDescription}
          />
          <CategoryUpdateActions
            actions={categoryActions}
            setActions={setCategoryActions}
          />
        </div>
        <div className="flex-1" />
        <RightDrawerFooter className="px-0 gap-2 sm:flex-row sm:justify-end">
          <RightDrawerClose asChild>
            <Button variant="outline">{closeLabel}</Button>
          </RightDrawerClose>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!isFormValid}
            aria-disabled={!isFormValid}
          >
            {primaryLabel}
          </Button>
        </RightDrawerFooter>
      </RightDrawerContent>
    </RightDrawer>
  );
}
