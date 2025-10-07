import * as React from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/i18n/use-translations";

import styles from "./category-card.module.css";

type Props = {
  category: CategoryDetail;
  className?: string;
};

const ACTION_LABEL_FALLBACKS: Record<
  CategoryDetail["actions"][number]["type"],
  string
> = {
  assign_categories: "Assign category",
  move_to_folder: "Move to folder",
  forward_to: "Forward to",
  reply_with_message: "Reply with a message",
};

export default function CategoryCard({ category, className }: Props) {
  const { t } = useTranslations("configurations");

  const actions = category.actions ?? [];
  const description = category.description.trim();
  const hasDescription = description.length > 0;
  const emptyLabel = t("category.actions.empty", "No actions configured yet.");

  return (
    <Card className={cn(styles.card, className)} data-testid="category-card">
      <CardHeader className={styles.header}>
        <CardTitle>{category.name}</CardTitle>
        {hasDescription ? (
          <CardDescription className={styles.description}>
            {description}
          </CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className={styles.content}>
        {actions.length === 0 ? (
          <p className={styles.empty}>{emptyLabel}</p>
        ) : (
          <ul className={styles.tagList} role="list">
            {actions.map((action) => {
              const label = t(
                `category.actions.types.${action.type}`,
                ACTION_LABEL_FALLBACKS[action.type]
              );

              return (
                <li key={action.id} className={styles.tag} role="listitem">
                  {label}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
