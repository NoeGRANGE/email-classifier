"use client";

import React from "react";
import styles from "./plans.module.css";
import { Check } from "lucide-react";
import { useTranslations } from "@/i18n/use-translations";

type Props = {
  name: string;
  mailboxes: number | string;
  price: string;
  action: string;
  callBack: () => void;
};

export default function PlanComponent({
  name,
  mailboxes,
  price,
  action,
  callBack,
}: Props) {
  const { t } = useTranslations("home");

  return (
    <div className={styles.container}>
      <h2>{name}</h2>
      <p className={styles.price}>{price}</p>
      <p className={styles.billing}>{t("plans.billing")}</p>
      <p className={styles.feature}>
        <Check aria-hidden="true" /> {mailboxes}
      </p>
      <p className={styles.feature}>
        <Check aria-hidden="true" /> {t("plans.members")}
      </p>
      <p className={styles.feature}>
        <Check aria-hidden="true" /> {t("plans.classifications")}
      </p>
      <button onClick={callBack}>{action}</button>
    </div>
  );
}
