"use client";

import * as React from "react";

import styles from "./actions.module.css";
import { useTranslations } from "@/i18n/use-translations";

type Props = {
  actions: CategoryAction[];
  setActions: (actions: CategoryAction[]) => void;
};

export default function CategoryUpdateActions({ actions, setActions }: Props) {
  const { t } = useTranslations("configurations");

  return (
    <>
      <label className="text-sm font-medium">Actions</label>
      <div className={styles.field}>{actions.map((action) => action.type)}</div>
    </>
  );
}
