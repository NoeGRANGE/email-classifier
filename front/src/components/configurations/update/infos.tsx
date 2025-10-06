"use client";

import * as React from "react";

import styles from "./infos.module.css";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "@/i18n/use-translations";

type Props = {
  name: string;
  setName: (name: string) => void;
  description: string;
  setDescription: (description: string) => void;
};

export default function CategoryUpdateInfos({
  name,
  setName,
  description,
  setDescription,
}: Props) {
  const { t } = useTranslations("configurations");
  const nameId = React.useId();
  const descriptionId = React.useId();

  return (
    <>
      <div className={styles.field}>
        <label htmlFor={nameId} className="text-sm font-medium">
          {t("category.update.details.nameLabel", "Category name")}
        </label>
        <Input
          className={styles.input}
          id={nameId}
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t(
            "category.update.details.namePlaceholder",
            "e.g. Important leads"
          )}
        />
      </div>
      <div className={styles.field}>
        <label htmlFor={descriptionId} className="text-sm font-medium">
          {t("category.update.details.descriptionLabel", "Description")}
        </label>
        <Textarea
          className={styles.textarea}
          id={descriptionId}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t(
            "category.update.details.descriptionPlaceholder",
            "Describe which emails belong in this category and why they fit."
          )}
          required
        />
      </div>
    </>
  );
}
