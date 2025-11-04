"use client";

import React from "react";

import { useTranslations } from "@/i18n/use-translations";

import styles from "./plans.module.css";
import PlanComponent from "./plan";

export default function HomePlans() {
  const { t, locale } = useTranslations("home");

  const signUpUrl = `${locale}/sign-up`;

  const BASE_PLANS = [
    {
      key: "solo",
      callBack: () => (window.location.href = signUpUrl),
    },
    {
      key: "team",
      callBack: () => (window.location.href = signUpUrl),
    },
    {
      key: "business",
      callBack: () => (window.location.href = signUpUrl),
    },
    {
      key: "enterprise",
      callBack: () => (window.location.href = "mailto:ngrange.dev@gmail.com"),
    },
  ];

  const plans = React.useMemo(
    () =>
      BASE_PLANS.map((plan) => ({
        ...plan,
        name: t(`plans.items.${plan.key}.title`),
        price: t(`plans.items.${plan.key}.price`),
        mailboxes: t(`plans.items.${plan.key}.mailboxes`),
        action: t(`plans.items.${plan.key}.action`),
      })),
    [t]
  );

  return (
    <div className={styles.wrapper}>
      {plans.map(({ key, name, price, mailboxes, action, callBack }) => (
        <PlanComponent
          key={key}
          name={name}
          price={price}
          mailboxes={mailboxes}
          action={action}
          callBack={callBack}
        />
      ))}
    </div>
  );
}
